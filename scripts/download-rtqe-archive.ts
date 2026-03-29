import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_TARGET_TIMESTAMP = "20240720215734";
const TARGET_TIMESTAMP = process.argv[2] ?? DEFAULT_TARGET_TIMESTAMP;
const ARCHIVE_SCOPE = "http://www.rtqe.net/ObliqueStrategies/*";
const ORIGIN = "http://www.rtqe.net";
const SCOPE_PATH = "/ObliqueStrategies";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../public/rtqe-archive");
const MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.json");

const TEXT_MIME_PREFIXES = ["text/", "application/javascript", "application/x-javascript", "application/json", "application/xml", "image/svg+xml"];

type CdxRow = {
  timestamp: string;
  original: string;
  statuscode: string;
  mimetype: string;
  digest: string;
  length: string;
};

type Capture = CdxRow & {
  originalKey: string;
  localPath: string;
  waybackUrl: string;
};

type ManifestEntry = Capture;
type FailedDownload = {
  localPath: string;
  originalKey: string;
  attempts: string[];
};

function isExcludedLocalPath(localPath: string) {
  return localPath === ".por" || localPath.includes("’");
}

function getLocalPathKey(localPath: string) {
  return localPath.toLowerCase();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function canonicalizeOriginal(input: string): string {
  const url = new URL(input);
  url.hash = "";

  if ((url.protocol === "http:" && url.port === "80") || (url.protocol === "https:" && url.port === "443")) {
    url.port = "";
  }

  return url.toString();
}

function getStatusPriority(statuscode: string): number {
  switch (statuscode) {
    case "200":
      return 0;
    case "-":
      return 1;
    case "301":
      return 2;
    case "302":
      return 3;
    default:
      return 99;
  }
}

function scoreCapture(row: CdxRow) {
  const statusPriority = getStatusPriority(row.statuscode);
  const distance = Math.abs(Number(row.timestamp) - Number(TARGET_TIMESTAMP));
  return { statusPriority, distance };
}

function isBetterCapture(candidate: CdxRow, current: CdxRow) {
  const candidateScore = scoreCapture(candidate);
  const currentScore = scoreCapture(current);

  if (candidateScore.statusPriority !== currentScore.statusPriority) {
    return candidateScore.statusPriority < currentScore.statusPriority;
  }

  if (candidateScore.distance !== currentScore.distance) {
    return candidateScore.distance < currentScore.distance;
  }

  return candidate.timestamp > current.timestamp;
}

function appendQuerySuffix(localPath: string, search: string) {
  const parsed = path.posix.parse(localPath);
  const querySuffix = encodeURIComponent(search.replace(/^\?/, ""));
  return path.posix.join(parsed.dir, `${parsed.name}__q__${querySuffix}${parsed.ext}`);
}

function toLocalPath(original: string): string | null {
  const url = new URL(original);

  if (url.hostname !== "www.rtqe.net") {
    return null;
  }

  const pathname = decodeURIComponent(url.pathname);

  if (!(pathname === SCOPE_PATH || pathname.startsWith(`${SCOPE_PATH}/`))) {
    return null;
  }

  let localPath = pathname.slice(SCOPE_PATH.length).replace(/^\/+/, "");

  if (pathname === SCOPE_PATH || pathname.endsWith("/")) {
    localPath = path.posix.join(localPath, "index.html");
  }

  if (!localPath) {
    localPath = "index.html";
  }

  if (url.search) {
    localPath = appendQuerySuffix(localPath, url.search);
  }

  return localPath;
}

function isTextMime(mimetype: string) {
  return TEXT_MIME_PREFIXES.some((prefix) => mimetype.startsWith(prefix));
}

async function requestWithRetry(url: string, init?: RequestInit, attempt = 1): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; rtqe-archive-downloader/1.0)",
      ...(init?.headers ?? {}),
    },
  });

  if (response.ok || ![408, 425, 429, 500, 502, 503, 504].includes(response.status)) {
    return response;
  }

  if (attempt >= 5) {
    return response;
  }

  const retryAfter = Number(response.headers.get("retry-after") ?? "0");
  const delayMs = retryAfter > 0 ? retryAfter * 1000 : attempt * 1500;
  await sleep(delayMs);
  return requestWithRetry(url, init, attempt + 1);
}

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  const response = await requestWithRetry(url, init);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText}) for ${url}`);
  }

  return response;
}

async function fetchCdxRows(): Promise<CdxRow[]> {
  const cdxUrl = new URL("https://web.archive.org/cdx/search/cdx");
  cdxUrl.searchParams.set("url", ARCHIVE_SCOPE);
  cdxUrl.searchParams.set("output", "json");
  cdxUrl.searchParams.set("fl", "timestamp,original,statuscode,mimetype,digest,length");
  cdxUrl.searchParams.set("filter", "!statuscode:404");

  const response = await fetchWithRetry(cdxUrl.toString());
  const data = (await response.json()) as string[][];

  if (data.length === 0) {
    return [];
  }

  const [header, ...rows] = data;
  return rows.map((row) => {
    const entry = Object.fromEntries(header.map((column, index) => [column, row[index] ?? ""])) as Record<string, string>;
    return {
      timestamp: entry.timestamp,
      original: entry.original,
      statuscode: entry.statuscode,
      mimetype: entry.mimetype,
      digest: entry.digest,
      length: entry.length,
    } satisfies CdxRow;
  });
}

function selectCaptures(rows: CdxRow[]): Capture[] {
  const selected = new Map<string, Capture>();

  for (const row of rows) {
    if (getStatusPriority(row.statuscode) >= 99) {
      continue;
    }

    const originalKey = canonicalizeOriginal(row.original);
    const localPath = toLocalPath(originalKey);

    if (!localPath || isExcludedLocalPath(localPath)) {
      continue;
    }

    const candidate = {
      ...row,
      originalKey,
      localPath,
      waybackUrl: `https://web.archive.org/web/${row.timestamp}id_/${originalKey}`,
    } satisfies Capture;

    const key = getLocalPathKey(localPath);
    const current = selected.get(key);

    if (!current || isBetterCapture(candidate, current) || (candidate.timestamp === current.timestamp && candidate.localPath < current.localPath)) {
      selected.set(key, candidate);
    }
  }

  return [...selected.values()].sort((a, b) => a.localPath.localeCompare(b.localPath));
}

function relativeReference(fromLocalPath: string, toLocalPath: string) {
  const fromDir = path.posix.dirname(`/${fromLocalPath}`);
  const toFile = `/${toLocalPath}`;
  const relative = path.posix.relative(fromDir, toFile);
  return relative || path.posix.basename(toFile);
}

function unwrapWaybackUrl(value: string): string {
  let unwrapped = value;

  const absoluteMatch = unwrapped.match(/^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\/(https?:\/\/.*)$/i);
  if (absoluteMatch?.[1]) {
    unwrapped = absoluteMatch[1];
  }

  const protocolRelativeMatch = unwrapped.match(/^\/\/web\.archive\.org\/web\/\d+[a-z_]*\/(https?:\/\/.*)$/i);
  if (protocolRelativeMatch?.[1]) {
    unwrapped = protocolRelativeMatch[1];
  }

  const pathOnlyMatch = unwrapped.match(/^\/web\/\d+[a-z_]*\/(https?:\/\/.*)$/i);
  if (pathOnlyMatch?.[1]) {
    unwrapped = pathOnlyMatch[1];
  }

  return unwrapped;
}

function rewriteReference(rawValue: string, currentLocalPath: string): string | null {
  const value = unwrapWaybackUrl(rawValue);

  if (value.startsWith("mailto:") || value.startsWith("javascript:") || value.startsWith("data:")) {
    return null;
  }

  let targetUrl: URL;

  if (value.startsWith("/ObliqueStrategies")) {
    targetUrl = new URL(value, ORIGIN);
  } else if (value.startsWith("http://") || value.startsWith("https://")) {
    targetUrl = new URL(value);
  } else {
    return null;
  }

  const localTarget = toLocalPath(targetUrl.toString());
  if (!localTarget) {
    return null;
  }

  const relative = relativeReference(currentLocalPath, localTarget);
  return `${relative}${targetUrl.hash}`;
}

function rewriteTextContent(content: string, currentLocalPath: string): string {
  const patterns = [
    /https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\/https?:\/\/[^"'\s)<>{}]+/gi,
    /\/\/web\.archive\.org\/web\/\d+[a-z_]*\/https?:\/\/[^"'\s)<>{}]+/gi,
    /\/web\/\d+[a-z_]*\/https?:\/\/[^"'\s)<>{}]+/gi,
    /https?:\/\/www\.rtqe\.net\/ObliqueStrategies[^"'\s)<>{}]*/gi,
    /\/ObliqueStrategies\/[^"'\s)<>{}]*/g,
  ];

  let output = content;

  for (const pattern of patterns) {
    output = output.replace(pattern, (match) => rewriteReference(match, currentLocalPath) ?? match);
  }

  return output;
}

async function cleanOutputDir() {
  await rm(OUTPUT_DIR, { force: true, recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
}

async function downloadCapture(capture: Capture): Promise<FailedDownload | null> {
  const attempts = [
    `https://web.archive.org/web/${capture.timestamp}id_/${capture.originalKey}`,
    `https://web.archive.org/web/${capture.timestamp}if_/${capture.originalKey}`,
    `https://web.archive.org/web/${capture.timestamp}/${capture.originalKey}`,
  ];

  for (const url of attempts) {
    const response = await requestWithRetry(url);

    if (!response.ok) {
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filePath = path.join(OUTPUT_DIR, capture.localPath);

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    return null;
  }

  return {
    localPath: capture.localPath,
    originalKey: capture.originalKey,
    attempts,
  } satisfies FailedDownload;
}

async function rewriteDownloadedTextFiles(captures: Capture[]) {
  for (const capture of captures) {
    if (!isTextMime(capture.mimetype)) {
      continue;
    }

    const filePath = path.join(OUTPUT_DIR, capture.localPath);
    const originalText = await readFile(filePath, "utf8");
    const rewrittenText = rewriteTextContent(originalText, capture.localPath);

    if (rewrittenText !== originalText) {
      await writeFile(filePath, rewrittenText);
    }
  }
}

async function writeManifest(captures: ManifestEntry[]) {
  await writeFile(MANIFEST_PATH, `${JSON.stringify(captures, null, 2)}\n`);
}

async function writeFailedManifest(failures: FailedDownload[]) {
  if (failures.length === 0) {
    return;
  }

  await writeFile(path.join(OUTPUT_DIR, "manifest.failed.json"), `${JSON.stringify(failures, null, 2)}\n`);
}

async function main() {
  console.log(`Fetching CDX index for ${ARCHIVE_SCOPE}`);
  const rows = await fetchCdxRows();
  const captures = selectCaptures(rows);

  console.log(`Selected ${captures.length} files near ${TARGET_TIMESTAMP}`);

  await cleanOutputDir();

  const downloaded: Capture[] = [];
  const failures: FailedDownload[] = [];

  for (const [index, capture] of captures.entries()) {
    console.log(`[${index + 1}/${captures.length}] ${capture.localPath}`);
    const failure = await downloadCapture(capture);

    if (failure) {
      console.warn(`Failed: ${failure.localPath}`);
      failures.push(failure);
    } else {
      downloaded.push(capture);
    }

    await sleep(150);
  }

  console.log("Rewriting internal archive references");
  await rewriteDownloadedTextFiles(downloaded);

  console.log(`Writing manifest to ${MANIFEST_PATH}`);
  await writeManifest(downloaded);
  await writeFailedManifest(failures);

  if (failures.length > 0) {
    console.warn(`Done with ${failures.length} failed downloads. See ${path.join(OUTPUT_DIR, "manifest.failed.json")}`);
  } else {
    console.log(`Done. Files written to ${OUTPUT_DIR}`);
  }
}

await main();

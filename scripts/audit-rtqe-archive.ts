import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../public/rtqe-archive");
const SCOPE_PATH = "/ObliqueStrategies/";
const INTERNAL_HOSTS = new Set(["www.rtqe.net", "rtqe.net"]);

const HTML_EXTENSIONS = new Set([".html", ".htm", ".cgi"]);
const CSS_EXTENSIONS = new Set([".css"]);
const TEXT_EXTENSIONS = new Set([".html", ".htm", ".cgi", ".css", ".txt", ".js", ".xml", ".svg"]);

const ATTR_PATTERNS = [
  /\b(?:href|src|action|background)\s*=\s*"([^"]+)"/gi,
  /\b(?:href|src|action|background)\s*=\s*'([^']+)'/gi,
  /\b(?:href|src|action|background)\s*=\s*(?!["'])([^\s>]+)/gi,
];
const CSS_URL_PATTERN = /url\(([^)]+)\)/gi;
const META_REFRESH_PATTERN = /<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]+content\s*=\s*["'][^"']*url=([^"']+)["']/gi;

type Reference = {
  source: string;
  raw: string;
  resolved: string;
};

type InvalidFile = {
  path: string;
  reason: string;
};

function appendQuerySuffix(localPath: string, search: string) {
  const parsed = path.posix.parse(localPath);
  const querySuffix = encodeURIComponent(search.replace(/^\?/, ""));
  return path.posix.join(parsed.dir, `${parsed.name}__q__${querySuffix}${parsed.ext}`);
}

function toArchiveRelativePathFromUrl(rawUrl: string): string | null {
  const url = new URL(rawUrl);

  if (!INTERNAL_HOSTS.has(url.hostname)) {
    return null;
  }

  const pathname = decodeURIComponent(url.pathname);
  if (!pathname.startsWith(SCOPE_PATH)) {
    return null;
  }

  let relative = pathname.slice(SCOPE_PATH.length);
  if (pathname.endsWith("/") || relative.length === 0) {
    relative = path.posix.join(relative, "index.html");
  }

  if (url.search) {
    relative = appendQuerySuffix(relative, url.search);
  }

  return relative;
}

function stripWrapping(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function normalizeRelativeTarget(fromFile: string, rawValue: string): string | null {
  const clean = stripWrapping(rawValue).replace(/\s+/g, "");

  if (
    clean.length === 0 ||
    clean.startsWith("#") ||
    clean.startsWith("mailto:") ||
    clean.startsWith("javascript:") ||
    clean.startsWith("data:") ||
    /[<>;]/.test(clean) ||
    clean.includes('+"') ||
    clean.includes('"+')
  ) {
    return null;
  }

  const withoutHash = clean.split("#")[0] ?? clean;

  if (/^https?:\/\//i.test(withoutHash)) {
    return toArchiveRelativePathFromUrl(withoutHash);
  }

  if (withoutHash.startsWith("//")) {
    return toArchiveRelativePathFromUrl(`http:${withoutHash}`);
  }

  if (withoutHash.startsWith("/")) {
    if (!withoutHash.startsWith(SCOPE_PATH)) {
      return null;
    }

    const target = withoutHash.slice(SCOPE_PATH.length);
    return target.length === 0 ? "index.html" : target;
  }

  const baseDir = path.posix.dirname(fromFile);
  const resolved = path.posix.normalize(path.posix.join(baseDir, withoutHash));
  return resolved.replace(/^\/+/, "");
}

function collectMatches(pattern: RegExp, content: string) {
  const results: string[] = [];
  for (const match of content.matchAll(pattern)) {
    const value = match[1]?.trim();
    if (value) {
      results.push(value);
    }
  }
  return results;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    }),
  );
  return files.flat();
}

function isLikelyHtmlExtension(file: string) {
  return HTML_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function isLikelyCssExtension(file: string) {
  return CSS_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function isLikelyTextExtension(file: string) {
  return TEXT_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function validateBinary(relPath: string, buffer: Buffer): string | null {
  const ext = path.extname(relPath).toLowerCase();

  if (buffer.length === 0) {
    return "empty file";
  }

  if (ext === ".gif") {
    const header = buffer.subarray(0, 6).toString("ascii");
    return header === "GIF87a" || header === "GIF89a" ? null : "invalid GIF header";
  }

  if (ext === ".jpg" || ext === ".jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff ? null : "invalid JPEG header";
  }

  if (ext === ".png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? null : "invalid PNG header";
  }

  if (ext === ".ico") {
    return buffer.subarray(0, 4).equals(Buffer.from([0x00, 0x00, 0x01, 0x00])) ? null : "invalid ICO header";
  }

  if (ext === ".zip") {
    return buffer.subarray(0, 2).toString("ascii") === "PK" ? null : "invalid ZIP header";
  }

  return null;
}

async function main() {
  const rootStat = await stat(ROOT);
  if (!rootStat.isDirectory()) {
    throw new Error(`Missing archive root: ${ROOT}`);
  }

  const absoluteFiles = await walk(ROOT);
  const relativeFiles = absoluteFiles.map((file) => path.relative(ROOT, file).split(path.sep).join(path.posix.sep)).sort();
  const fileSet = new Set(relativeFiles);

  const references: Reference[] = [];
  const missing = new Map<string, Set<string>>();
  const invalidFiles: InvalidFile[] = [];

  for (const relPath of relativeFiles) {
    const absPath = path.join(ROOT, relPath);
    const buffer = await readFile(absPath);

    const binaryIssue = validateBinary(relPath, buffer);
    if (binaryIssue) {
      invalidFiles.push({ path: relPath, reason: binaryIssue });
    }

    if (!isLikelyTextExtension(relPath)) {
      continue;
    }

    const content = buffer.toString("utf8");
    const rawRefs = new Set<string>();

    if (isLikelyHtmlExtension(relPath)) {
      for (const pattern of ATTR_PATTERNS) {
        for (const value of collectMatches(pattern, content)) {
          rawRefs.add(value);
        }
      }
      for (const value of collectMatches(META_REFRESH_PATTERN, content)) {
        rawRefs.add(value);
      }
      for (const value of collectMatches(CSS_URL_PATTERN, content)) {
        rawRefs.add(value);
      }
    } else if (isLikelyCssExtension(relPath)) {
      for (const value of collectMatches(CSS_URL_PATTERN, content)) {
        rawRefs.add(value);
      }
    }

    for (const raw of rawRefs) {
      const resolved = normalizeRelativeTarget(relPath, raw);
      if (!resolved) {
        continue;
      }

      references.push({ source: relPath, raw, resolved });

      if (!fileSet.has(resolved)) {
        const existing = missing.get(resolved) ?? new Set<string>();
        existing.add(relPath);
        missing.set(resolved, existing);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        root: ROOT,
        fileCount: relativeFiles.length,
        referenceCount: references.length,
        missingCount: missing.size,
        invalidCount: invalidFiles.length,
        missing: [...missing.entries()]
          .map(([target, sources]) => ({ target, sources: [...sources].sort() }))
          .sort((a, b) => a.target.localeCompare(b.target)),
        invalidFiles: invalidFiles.sort((a, b) => a.path.localeCompare(b.path)),
      },
      null,
      2,
    ),
  );
}

await main();

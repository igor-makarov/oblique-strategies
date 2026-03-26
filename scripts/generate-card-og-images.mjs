import { access, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const outputWidth = 1200;
const outputHeight = 630;
const cardRoutePrefix = "/cards";
const clientBuildDir = fileURLToPath(new URL("../build/client", import.meta.url));
const cardPagesDir = fileURLToPath(new URL("../build/client/cards", import.meta.url));
const imageOutputDir = fileURLToPath(new URL("../build/client/og/cards", import.meta.url));

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".data": "application/json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const browserCandidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

function contentTypeFor(filePath) {
  return mimeTypes[path.extname(filePath)] ?? "application/octet-stream";
}

async function resolveRequestPath(urlPathname) {
  const pathname = decodeURIComponent(urlPathname);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const candidate = path.resolve(clientBuildDir, `.${requestedPath}`);

  if (!candidate.startsWith(clientBuildDir)) {
    throw new Error("Invalid path");
  }

  const candidateStat = await stat(candidate).catch(() => null);
  if (candidateStat?.isDirectory()) {
    return path.join(candidate, "index.html");
  }

  if (candidateStat?.isFile()) {
    return candidate;
  }

  if (!path.extname(candidate)) {
    return path.join(candidate, "index.html");
  }

  return candidate;
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const filePath = await resolveRequestPath(requestUrl.pathname);
      const fileBuffer = await readFile(filePath);

      response.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
      response.end(fileBuffer);
    } catch (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not Found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to determine preview server address");
  }

  return {
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    },
    origin: `http://127.0.0.1:${address.port}`,
  };
}

async function findBrowserExecutable() {
  for (const candidate of browserCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }

  throw new Error("No Chrome/Chromium executable found. Set PUPPETEER_EXECUTABLE_PATH to a local browser binary.");
}

async function main() {
  const entries = await readdir(cardPagesDir, { withFileTypes: true });
  const cardDirectories = entries.filter((entry) => entry.isDirectory());
  const executablePath = await findBrowserExecutable();
  const server = await startStaticServer();

  await rm(imageOutputDir, { recursive: true, force: true });
  await mkdir(imageOutputDir, { recursive: true });

  const browser = await puppeteer.launch({
    args: ["--disable-dev-shm-usage", "--hide-scrollbars", ...(process.env.CI ? ["--no-sandbox"] : [])],
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ height: outputHeight, width: outputWidth, deviceScaleFactor: 1 });

    for (const entry of cardDirectories) {
      const slug = entry.name;
      const outputFile = path.join(imageOutputDir, `${slug}.png`);

      await page.goto(`${server.origin}${cardRoutePrefix}/${slug}`, { waitUntil: "networkidle0" });
      await page.screenshot({ path: outputFile, type: "png" });
    }
  } finally {
    await browser.close();
    await server.close();
  }

  console.log(`Generated ${cardDirectories.length} card og:image files in ${imageOutputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

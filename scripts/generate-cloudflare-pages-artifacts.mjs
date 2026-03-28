import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const clientBuildDir = path.resolve("build/client");
const workerFilePath = path.join(clientBuildDir, "_worker.js");
const routesFilePath = path.join(clientBuildDir, "_routes.json");

const workerSource = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/test") {
      return Response.json({ ok: true, pathname: url.pathname });
    }

    return env.ASSETS.fetch(request);
  },
};
`;

async function collectFiles(dir, rootDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, rootDir)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    files.push(path.relative(rootDir, absolutePath).split(path.sep).join("/"));
  }

  return files;
}

function buildRoutesJson(files) {
  const excludes = new Set();
  const topLevelDirs = new Set();

  for (const file of files) {
    if (file === "_worker.js" || file === "_routes.json") {
      continue;
    }

    const parts = file.split("/");

    if (parts[0] === "assets") {
      excludes.add("/assets/*");
      continue;
    }

    if (parts.length === 1) {
      if (file === "index.html") {
        excludes.add("/");
        excludes.add("/index.html");
        continue;
      }

      excludes.add(`/${file}`);
      continue;
    }

    topLevelDirs.add(parts[0]);
  }

  for (const dir of topLevelDirs) {
    if (files.includes(`${dir}.data`)) {
      excludes.add(`/${dir}.data`);
    }

    excludes.add(`/${dir}/*`);
  }

  return {
    version: 1,
    include: ["/*"],
    exclude: [...excludes].sort(),
  };
}

async function main() {
  const clientBuildStats = await stat(clientBuildDir).catch(() => null);

  if (!clientBuildStats?.isDirectory()) {
    throw new Error(`Missing build output directory: ${clientBuildDir}`);
  }

  const files = await collectFiles(clientBuildDir);
  const routesJson = buildRoutesJson(files);

  await writeFile(workerFilePath, workerSource);
  await writeFile(routesFilePath, JSON.stringify(routesJson, null, 2) + "\n");

  console.log(`Wrote ${path.relative(process.cwd(), workerFilePath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), routesFilePath)}`);
}

await main();

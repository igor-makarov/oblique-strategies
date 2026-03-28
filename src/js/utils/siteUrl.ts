export function getSiteOrigin(): string {
  let configuredOrigin: string;
  if (process.env.WORKERS_CI_BRANCH && process.env.WORKERS_CI_BRANCH != "main") {
    configuredOrigin = `https://${process.env.WORKERS_CI_BRANCH}-oblique-strategies-w.igormaka.workers.dev/`;
  } else {
    configuredOrigin = process.env.CF_PAGES_URL || process.env.SITEMAP_BASE_URL;
  }

  if (!configuredOrigin) {
    throw new Error("WORKERS_CI_BRANCH or CF_PAGES_URL or SITEMAP_BASE_URL environment variable is required");
  }

  return configuredOrigin.replace(/\/$/, "");
}

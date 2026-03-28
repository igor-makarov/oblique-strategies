export function getSiteOrigin(): string {
  const configuredOrigin = process.env.CF_PAGES_URL || process.env.SITEMAP_BASE_URL;

  if (!configuredOrigin) {
    throw new Error("CF_PAGES_URL or SITEMAP_BASE_URL environment variable is required");
  }

  return configuredOrigin.replace(/\/$/, "");
}

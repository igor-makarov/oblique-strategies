export function getSiteOrigin(): string {
  const configuredOrigin = process.env.SITEMAP_BASE_URL;

  if (!configuredOrigin) {
    throw new Error("SITEMAP_BASE_URL environment variable is required");
  }

  return configuredOrigin.replace(/\/$/, "");
}

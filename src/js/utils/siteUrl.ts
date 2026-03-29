export function getSiteOrigin(): string {
  const configuredOrigin = process.env.SITE_URL;

  if (!configuredOrigin) {
    throw new Error("SITE_URL environment variable is required");
  }

  return configuredOrigin.replace(/\/$/, "");
}

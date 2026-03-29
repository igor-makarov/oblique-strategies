export function getSiteOrigin(): string {
  const configuredOrigin = process.env.BASE_URL;

  if (!configuredOrigin) {
    throw new Error("BASE_URL environment variable is required");
  }

  return configuredOrigin.replace(/\/$/, "");
}

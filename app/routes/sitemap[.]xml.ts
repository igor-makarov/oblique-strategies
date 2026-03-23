import { generateRemixSitemap } from "@forge42/seo-tools/remix/sitemap";
import { routes } from "virtual:react-router/server-build";

export const loader = async () => {
  const domain = process.env.SITEMAP_BASE_URL;
  if (!domain) {
    throw new Error("SITEMAP_BASE_URL environment variable is required");
  }

  const sitemap = await generateRemixSitemap({ domain, routes });

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};

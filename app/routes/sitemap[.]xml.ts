import { generateRemixSitemap } from "@forge42/seo-tools/remix/sitemap";
import { routes } from "virtual:react-router/server-build";

import { getSiteOrigin } from "#src/js/utils/siteUrl";

export const loader = async () => {
  console.log("[route] /sitemap.xml");

  const sitemap = await generateRemixSitemap({
    domain: getSiteOrigin(),
    routes,
    ignore: ["*.png"],
  });

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};

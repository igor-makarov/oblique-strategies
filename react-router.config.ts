import type { Config } from "@react-router/dev/config";

import { collectCardRoutes, collectOgImageRoutes } from "#src/js/utils/collectStrategyRoutes";

const prerenderConcurrency = Number(process.env.PRERENDER_CONCURRENCY || "8");

export default {
  appDirectory: "app",
  ssr: false,
  prerender: {
    unstable_concurrency: prerenderConcurrency,
    paths: async function prerender({ getStaticPaths }) {
      const staticPaths = getStaticPaths();
      const cardPaths = collectCardRoutes();
      const ogImagePaths = collectOgImageRoutes();

      return [...new Set([...staticPaths, ...cardPaths, ...ogImagePaths])];
    },
  },
  basename: process.env.BASE_URL || "/",
} satisfies Config;

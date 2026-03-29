import type { Config } from "@react-router/dev/config";

import { collectCardRoutes } from "#src/js/utils/collectStrategyRoutes";

const prerenderConcurrency = Number(process.env.PRERENDER_CONCURRENCY || "8");

export default {
  appDirectory: "app",

  prerender: {
    unstable_concurrency: prerenderConcurrency,
    paths: async function prerender({ getStaticPaths }) {
      const staticPaths = getStaticPaths();
      const cardPaths = collectCardRoutes();

      return [...new Set([...staticPaths, ...cardPaths])];
    },
  },

  basename: process.env.BASE_URL || "/",

  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;

import type { Config } from "@react-router/dev/config";

import { collectCardRoutes, collectOgCardRoutes, collectOgIndexRoutes } from "./src/js/utils/collectStrategyRoutes";

export default {
  appDirectory: "app",
  ssr: false,
  prerender: async function prerender({ getStaticPaths }) {
    const staticPaths = getStaticPaths();
    const cardPaths = collectCardRoutes();
    const ogCardPaths = collectOgCardRoutes();
    const ogIndexPaths = collectOgIndexRoutes();

    return [...new Set([...staticPaths, ...cardPaths, ...ogCardPaths, ...ogIndexPaths])];
  },
  basename: process.env.BASE_URL || "/",
  trailingSlash: false,
} satisfies Config;

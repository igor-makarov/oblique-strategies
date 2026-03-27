import type { Config } from "@react-router/dev/config";

import { collectCardRoutes, collectOgCardRoutes } from "./src/js/utils/collectStrategyRoutes";

export default {
  appDirectory: "app",
  ssr: false,
  prerender: async function prerender({ getStaticPaths }) {
    const staticPaths = getStaticPaths();
    const cardPaths = collectCardRoutes();
    const ogCardPaths = collectOgCardRoutes();

    return [...new Set([...staticPaths, ...cardPaths, ...ogCardPaths])];
  },
  basename: process.env.BASE_URL || "/",
} satisfies Config;

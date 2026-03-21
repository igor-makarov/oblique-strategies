import type { Config } from "@react-router/dev/config";

import { collectCardRoutes } from "./src/js/utils/collectStrategyRoutes";

export default {
  appDirectory: "app",
  ssr: false,
  prerender: async function prerender({ getStaticPaths }) {
    const staticPaths = getStaticPaths();
    const cardPaths = collectCardRoutes();

    return [...new Set([...staticPaths, ...cardPaths])];
  },
  basename: process.env.BASE_URL || "/",
} satisfies Config;

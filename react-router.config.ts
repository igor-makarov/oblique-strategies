import type { Config } from "@react-router/dev/config";

import { collectCardRoutes, collectOgImageRoutes } from "./src/js/utils/collectStrategyRoutes";

export default {
  appDirectory: "app",
  ssr: false,
  prerender: async function prerender({ getStaticPaths }) {
    const staticPaths = getStaticPaths();
    const cardPaths = collectCardRoutes();
    const ogImagePaths = collectOgImageRoutes();

    return [...new Set([...staticPaths, ...cardPaths, ...ogImagePaths])];
  },
  basename: process.env.BASE_URL || "/",
} satisfies Config;

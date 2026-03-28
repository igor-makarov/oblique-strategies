import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { type Plugin, defineConfig, loadEnv } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

function lanServer(): Plugin {
  return {
    name: "lan-server",
    config({ server }, { mode }) {
      // Reads VITE_ALLOWED_HOSTS from .env.local
      const env = loadEnv(mode, process.cwd());
      if (mode !== "development") return;
      if (server?.allowedHosts != null) return;
      const allowedHosts = env.VITE_ALLOWED_HOSTS?.split(",");
      if (!allowedHosts?.length) return;
      return { server: { host: true, allowedHosts } };
    },
  };
}

function additionalHotReloadFiles(): Plugin {
  return {
    name: "additional-hot-reload-files",
    handleHotUpdate({ file, server }) {
      if (!file.endsWith("/src/js/data/obliqueStrategies.ts")) return;

      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}

export default defineConfig({
  build: {
    assetsDir: (process.env.BASE_URL || "/").substring(1) + "assets/",
  },
  define: {
    "process.env.SITEMAP_BASE_URL": JSON.stringify(process.env.SITEMAP_BASE_URL),
    "process.env.CF_PAGES_URL": JSON.stringify(process.env.CF_PAGES_URL),
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    lanServer(),
    additionalHotReloadFiles(),
    devtoolsJson(),
    tsconfigPaths(),
    reactRouter(),
  ],
});

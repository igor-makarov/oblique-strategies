import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
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

export default defineConfig({
  build: {
    assetsDir: (process.env.BASE_URL || "/").substring(1) + "assets/",
  },
  plugins: [
    lanServer(),
    devtoolsJson(),
    tsconfigPaths(),
    reactRouter(),
  ],
});

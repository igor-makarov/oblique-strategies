import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    assetsDir: (process.env.BASE_URL || "/").substring(1) + "assets/",
  },
  server: {
    allowedHosts: ["igors-macbook-air.local", "il-m-igor-ma-02.local"],
    host: true,
  },
  plugins: [tsconfigPaths(), reactRouter()],
});

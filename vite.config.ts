import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    assetsDir: (process.env.BASE_URL || "/").substring(1) + "assets/",
  },
  plugins: [tsconfigPaths(), reactRouter()],
});

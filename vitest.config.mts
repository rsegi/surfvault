import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { config } from "dotenv";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.ts"],
    exclude: ["test/setup.ts"],
    setupFiles: ["dotenv/config"],
    env: {
      ...config({ path: ".env.test" }).parsed,
    },
  },
});

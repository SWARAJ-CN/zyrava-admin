import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiOrigin = new URL(
    env.VITE_API_URL || "https://zyrava-server.onrender.com",
  ).origin;
  return {
    plugins: [react()],
    base: process.env.VITE_BASE ?? "/",
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
          configure(proxy) {
            // The browser talks to Vite on its own origin. Forward this as a
            // server-to-server request; admin bearer authentication still applies.
            proxy.on("proxyReq", (request) => request.removeHeader("origin"));
          },
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("leaflet")) return "leaflet";
          if (id.includes("react-router")) return "router";
        },
      },
    },
  },
  // SPA fallback — Cloudflare Pages obsłuży routing
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});

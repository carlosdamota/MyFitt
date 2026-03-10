import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      srcDir: "src",
      filename: "sw.js",
      strategies: "injectManifest",
      registerType: "prompt",
      includeAssets: ["favicon.svg", "pwa-192x192.png", "pwa-512x512.png", "robots.txt"],
      injectManifest: {
        // Only precache essential assets — lazy chunks are served via runtime cache in sw.js
        // This reduces SW install payload from ~1.95 MB to ~400 KB
        globPatterns: [
          "**/*.{html,css}",
          "assets/vendor-*.js",
          "assets/index-*.js",
          "**/*.{ico,png,svg,webp}",
        ],
      },
      manifest: {
        name: "FITTWIZ",
        short_name: "FITTWIZ",
        description: "FITTWIZ - Tu entrenador personal inteligente y registro de entrenamiento.",
        theme_color: "#020617",
        background_color: "#020617",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        id: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
    }),
  ],
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
          konva: ["konva", "react-konva"],
          vendor: ["react", "react-dom", "react-router", "@tanstack/react-query"],
          ui: ["lucide-react"],
          analytics: ["posthog-js"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});

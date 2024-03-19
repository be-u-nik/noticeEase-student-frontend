import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // strategies: "generateSW",
      strategies: "injectManifest",
      injectManifest: {
        rollupFormat: "iife",
      },
      registerType: "autoUpdate",
      srcDir: "src",
      filename: "sw.ts",
      includeAssets: ["SF-Pro-Text-Regular.otf", "profilePic.jpg"],
      manifest: {
        name: "NoticeEase",
        short_name: "NoticeEase",
        description: "App description",
        start_url: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
    // VitePWA(),
  ],
});

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import sourceIdentifierPlugin from "vite-plugin-source-info";
import { visualizer } from "rollup-plugin-visualizer";

const isProd = process.env.BUILD_MODE === "prod";

export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: "data-matrix",
      includeProps: true,
    }),
    visualizer({
      filename: "dist/bundle-stats.html",
      title: "Bundle Visualizer - Resale Expert",
      template: "treemap",
      gzipSize: true,
      brotliSize: true,
      open: false,
    }) as any,
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: true,
    allowedHosts: ['investordeal.in', 'localhost'],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        // target: "http://investordeal.in", // for server
        changeOrigin: true,
      },
      "/uploads": {
       target: "http://localhost:3000",
        // target: "http://investordeal.in" ,  // for server
        changeOrigin: true,
      },
    },
  },

  preview: {
    allowedHosts: ['investordeal.in', 'localhost']
  },

  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return;
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) return "vendor-react";
            if (id.includes("html2canvas")) return "vendor-html2canvas";
            if (id.includes("dompurify") || id.includes("purify")) return "vendor-purify";
            if (id.includes("recharts") || id.includes("chart.js") || id.includes("apexcharts"))
              return "vendor-charts";
            if (id.includes("@mui") || id.includes("antd") || id.includes("chakra-ui")) return "vendor-ui";
            return "vendor";
          }
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
  },
});
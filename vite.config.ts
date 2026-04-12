import path from "path";

import { crx } from "@crxjs/vite-plugin";
import type { ManifestV3Export } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import manifestJson from "./public/manifest.json";

declare const process: { env?: Record<string, string | undefined> };

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const isStaging = mode === "staging";
  const isDevelopment = mode === "development" || (!isProduction && !isStaging);
  const enableDebugLogs =
    (process && process.env && process.env.VITE_ENABLE_DEBUG_LOGS) === "true";

  return {
    plugins: [
      tailwindcss(),
      react(),
      crx({
        manifest: manifestJson as ManifestV3Export,
      }),
    ],
    build: {
      outDir: "dist",
      sourcemap: isDevelopment ? "inline" : isStaging ? true : false,
      minify: isProduction ? "terser" : false,
      target: "es2020",
      rollupOptions: {
        output: {
          manualChunks: isProduction
            ? {
                vendor: ["react", "react-dom"],
                mui: ["@mui/material", "@mui/icons-material", "@mui/lab"],
                utils: ["cheerio"],
              }
            : undefined,
          chunkFileNames: isProduction
            ? "assets/[name]-[hash].js"
            : "assets/[name].js",
          entryFileNames: isProduction
            ? "assets/[name]-[hash].js"
            : "assets/[name].js",
          assetFileNames: isProduction
            ? "assets/[name]-[hash].[ext]"
            : "assets/[name].[ext]",
        },
      },
      terserOptions:
        isProduction && !enableDebugLogs
          ? {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ["console.log", "console.info", "console.debug"],
              },
              mangle: {
                safari10: true,
              },
            }
          : undefined,
      reportCompressedSize: isProduction,
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      __STAGING__: isStaging,
    },
    esbuild: {
      drop: isProduction && !enableDebugLogs ? ["console", "debugger"] : [],
    },
  };
});

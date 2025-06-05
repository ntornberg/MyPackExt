import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import type {ManifestV3Export} from '@crxjs/vite-plugin';
import {crx} from '@crxjs/vite-plugin';
import manifestJson from './public/manifest.json';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isStaging = mode === 'staging';
  const isDevelopment = mode === 'development' || (!isProduction && !isStaging);

  return {
    plugins: [
      react(),
      crx({
        manifest: manifestJson as ManifestV3Export,
      }),
      // Obfuscation removed for faster builds
    ],
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment ? 'inline' : (isStaging ? true : false),
      minify: isProduction ? 'terser' : false,
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: isProduction ? {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material', '@mui/lab'],
            utils: ['cheerio', 'jsonpath-plus']
          } : undefined,
          chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          entryFileNames: isProduction ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          assetFileNames: isProduction ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]'
        }
      },
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          safari10: true
        }
      } : undefined,
      reportCompressedSize: isProduction,
      chunkSizeWarningLimit: 1000
    },
    resolve: {
      alias: {
        '@mui/styled-engine': '@mui/styled-engine',
      },
    },
    define: {
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      __STAGING__: isStaging
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    }
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import type { ManifestV3Export } from '@crxjs/vite-plugin';
import manifestJson from './public/manifest.json';
// @ts-ignore
import obfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isStaging = mode === 'staging';
  const isDevelopment = mode === 'development' || (!isProduction && !isStaging);

  return {
    plugins: [
      react({
        // Production optimizations for React
        ...(isProduction && {
          babel: {
            plugins: [
              ['@babel/plugin-transform-react-constant-elements'],
              ['@babel/plugin-transform-react-inline-elements']
            ]
          }
        })
      }),
      crx({
        manifest: manifestJson as ManifestV3Export,
      }),
      // Enable selective obfuscation only in production for specific files
      ...(isProduction ? [
        obfuscator({
          include: [
            '**/Data/**/*.ts',
            '**/Data/**/*.js',
            '**/services/api/**/*.ts',
            '**/services/api/**/*.js',
            '**/utils/**/*.ts',
            '**/utils/**/*.js',
            '**/cache/**/*.ts',
            '**/cache/**/*.js'
          ],
          exclude: [
            '**/node_modules/**',
            '**/components/**',
            '**/themes/**',
            '**/types/**'
          ],
          options: {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.8,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            renameGlobals: false, // Keep false to avoid breaking imports
            selfDefending: true,
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 0.5,
            transformObjectKeys: true,
            unicodeEscapeSequence: false
          }
        })
      ] : [])
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

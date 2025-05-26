import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import type { ManifestV3Export } from '@crxjs/vite-plugin'; // Use import type
import manifestJson from './public/manifest.json'; // Import the JSON
/*// @ts-ignore
import obfuscator from 'vite-plugin-javascript-obfuscator';*/

export default defineConfig({
  plugins: [
    /*obfuscator({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        renameGlobals: true,
      },

    }),*/
    react(),
    crx({
      manifest: manifestJson as ManifestV3Export, // Assert the manifest type
      // Remove srcDir option, rely on default ('src')
    } as { manifest: ManifestV3Export }) // <-- Assert the type of the options object (adjusting type assertion slightly)
  ],
  build: {
    outDir: 'dist',
    minify: false
  },
  resolve: {
    alias: {
      // Force MUI to use @emotion/styled directly
      '@mui/styled-engine': '@mui/styled-engine', // or '@emotion/react' if custom
    },
  },
});

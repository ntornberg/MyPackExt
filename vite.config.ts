import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import type { ManifestV3Export } from '@crxjs/vite-plugin'; // Use import type
import manifestJson from './public/manifest.json'; // Import the JSON

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: manifestJson as ManifestV3Export, // Assert the manifest type
      // Remove srcDir option, rely on default ('src')
    } as { manifest: ManifestV3Export }) // <-- Assert the type of the options object (adjusting type assertion slightly)
  ],
  build: {
    outDir: 'dist',
  },
});
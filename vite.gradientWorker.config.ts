import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/utils/GradientWorker/gradient_worker.ts',
      formats: ['es'],
      fileName: () => 'gradient_worker.js'
    },
    outDir: 'public', 
    emptyOutDir: false, 
    sourcemap: false,
    minify: true
  }
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/screen-saver.js'),
      name: 'ScreenSaver',
      fileName: 'screen-saver',
      formats: ['es']
    },
    outDir: 'dist',
    minify: true,
    sourcemap: true
  },
  server: {
    port: 5173,
    open: false
  }
});

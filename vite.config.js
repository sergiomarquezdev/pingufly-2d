// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './',
  publicDir: 'public',
  base: './',
  server: {
    host: true,
    open: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: true,
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});

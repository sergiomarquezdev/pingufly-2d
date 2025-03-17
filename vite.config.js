import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  build: {
    sourcemap: true,
    assetsInlineLimit: 0, // No inlinear assets como base64
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['fsevents']
  },
  publicDir: 'public',
  base: './'
});

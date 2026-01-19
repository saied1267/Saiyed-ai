import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.API_KEY_2': JSON.stringify(process.env.API_KEY_2),
    'process.env.API_KEY_3': JSON.stringify(process.env.API_KEY_3),
    'process.env.API_KEY_4': JSON.stringify(process.env.API_KEY_3)
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000
  }
});

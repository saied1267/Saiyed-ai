
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  define: {
    // জেমিনি এপিআই কি সমুহ
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ""),
    'process.env.API_KEY_2': JSON.stringify(process.env.API_KEY_2 || ""),
    'process.env.API_KEY_3': JSON.stringify(process.env.API_KEY_3 || ""),
    'process.env.API_KEY_4': JSON.stringify(process.env.API_KEY_4 || ""),
    
    // ফায়ারবেস কনফিগারেশন সমুহ
    'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY || ""),
    'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN || ""),
    'process.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID || ""),
    'process.env.FIREBASE_SENDER_ID': JSON.stringify(process.env.FIREBASE_SENDER_ID || ""),
    'process.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID || ""),
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

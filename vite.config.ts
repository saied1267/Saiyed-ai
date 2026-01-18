
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // এটি নেটলিফাই থেকে এপিআই কি সংগ্রহ করে কোডে যুক্ত করবে
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  },
  server: {
    port: 3000
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' giúp site chạy được dưới bất kỳ tên repo nào trên GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1500,
  },
});

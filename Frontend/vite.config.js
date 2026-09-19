import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev proxy lets the frontend call `/api/...` without CORS setup
// once the Express server is running on port 5000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/endpoint': {
        target: 'https://n2azfcvf05.execute-api.us-east-1.amazonaws.com/prod',
        changeOrigin: true,
      },
    },
  },
});

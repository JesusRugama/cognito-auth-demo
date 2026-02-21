import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/endpoint': {
        target: 'https://b5og4iojo5.execute-api.us-east-1.amazonaws.com/prod',
        changeOrigin: true,
      },
    },
  },
});

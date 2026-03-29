// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Cuando veas /api/... llévalo al backend de Django
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        // No hace falta rewrite porque queremos mantener /api en el path
      },
    },
  },
});

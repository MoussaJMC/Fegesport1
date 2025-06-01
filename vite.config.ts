import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      host: 'localhost'
    }
  },
  optimizeDeps: {
    exclude: [
      'lucide-react',
      'fluent-ffmpeg',
      'nodemailer',
      'whatsapp-web.js'
    ],
  },
  build: {
    rollupOptions: {
      external: [
        'fluent-ffmpeg',
        'nodemailer',
        'whatsapp-web.js'
      ]
    }
  }
});
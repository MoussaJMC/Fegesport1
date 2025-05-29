import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
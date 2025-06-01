import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    hmr: {
      clientPort: 443
    }
  },
  preview: {
    port: 5173,
    host: true
  },
  base: './',
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react',
      'sonner',
      'i18next',
      'react-i18next'
    ]
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react', 'sonner'],
          i18n: ['i18next', 'react-i18next'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
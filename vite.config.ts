import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    assetsInlineLimit: 0, // Empêche l'inlining des assets
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Preserve original names for favicons
          if (assetInfo.name === 'favicon.ico' || assetInfo.name === 'icone.png') {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  // Assurer que les assets sont correctement gérés
  publicDir: 'public',
});
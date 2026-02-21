import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Generate unique timestamp for each build to force cache invalidation
    const buildTimestamp = Date.now();
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: false,
        allowedHosts: [
          '3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai',
          '3001-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai',
          '3002-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai',
        ],
        hmr: {
          clientPort: 3001,
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            // Use content hash only - Vite will generate unique names when content changes
            entryFileNames: `assets/[name]-[hash].js`,
            chunkFileNames: `assets/[name]-[hash].js`,
            assetFileNames: `assets/[name]-[hash][extname]`
          }
        }
      }
    };
});

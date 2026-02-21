import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
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
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            // Force new hash by including timestamp in chunk names
            entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
            chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
            assetFileNames: `assets/[name]-[hash]-${Date.now()}[extname]`
          }
        }
      }
    };
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {

    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    server: {
      watch: {
        usePolling: true,
        interval: 2000,
        ignored: [
          path.resolve(__dirname, 'public/Data'),
          '**/public/Data/**',
          '**/*.json'
        ]
      }
    }
  };
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [react()],
    server: {
      port: 3000
    },
    define: {
      'process.env': env
    },
    resolve: {
      alias: {
        // Importante: aponta para a raiz já que não tens 'src'
        '@': path.resolve(process.cwd(), '.'),
      }      
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        input: 'index.html'
      }
    }
  };
});

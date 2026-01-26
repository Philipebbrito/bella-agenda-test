import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/', // Use barra para produção na Netlify
    plugins: [react()],
    define: {
      'process.env': env // Injeta todas as variáveis de uma vez
    },
    resolve: {
      alias: {
        // Como não tem pasta src, o @ aponta para a raiz onde estão os componentes
        '@': path.resolve(process.cwd(), '.'),
      }      
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(process.cwd(), 'index.html'),
        },
      },
    }
  };
});

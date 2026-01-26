import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis do arquivo .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Define variáveis globais (caso seu código antigo ainda use process.env)
    define: {
      'process.env': env, 
    },
    resolve: {
      alias: {
        // Garante que @ aponte para a pasta de código fonte
        '@': path.resolve(process.cwd(), './src'),
      }
    },
    // Otimização para evitar erros de dependências no carregamento
    optimizeDeps: {
      include: ['react', 'react-dom'],
    }
  };
});
/*import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      },
      resolve: {
        alias: {
          // Fix: __dirname is not available in ES modules. 
          // path.resolve('.') correctly resolves the project root in the Vite context.
          '@': path.resolve('.'),
        }
      }
    };
});*/

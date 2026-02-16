import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Library build for embedding
  if (mode === 'lib') {
    return {
      plugins: [react(), tailwindcss()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/embed.tsx'),
          name: 'StravaSearch',
          fileName: (format) => `strava-search.${format}.js`,
        },
        rollupOptions: {
          // Externalize deps that shouldn't be bundled
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
    };
  }

  // Default app build
  const port = process.env.PORT ? Number(process.env.PORT) : undefined;
  return {
    plugins: [react(), tailwindcss()],
    base: './',
    server: {
      port,
      strictPort: !!port,
    },
  };
});

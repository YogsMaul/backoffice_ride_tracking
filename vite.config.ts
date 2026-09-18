import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function removeHeavyPreloads(): Plugin {
  return {
    name: 'remove-heavy-preloads',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="modulepreload"[^>]*href="[^"]*\/map-[^"]*\.js"[^>]*>\s*/g,
        ''
      ).replace(
        /<link rel="stylesheet"[^>]*href="[^"]*\/map-[^"]*\.css"[^>]*>\s*/g,
        ''
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    removeHeavyPreloads(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-router')) {
              return 'react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            if (id.includes('axios')) {
              return 'axios';
            }
            if (id.includes('leaflet')) {
              return 'map';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          }
        },
      },
    },
    modulePreload: {
      polyfill: false,
    },
    cssCodeSplit: true,
    minify: 'terser',
    target: 'es2020',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
});

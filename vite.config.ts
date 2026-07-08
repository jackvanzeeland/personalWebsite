/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: '/',
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts']
  },
  build: {
    outDir: 'dist',
    // 'bundle' = Vite's hashed build output; distinct from public/ static files
    // (and from the retired top-level assets/ source folder)
    assetsDir: 'bundle',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'esbuild', // Use esbuild for faster builds
    target: 'es2015',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        '404': resolve(__dirname, '404.html')
      },
      output: {
        manualChunks: {
          three: ['three']
        },
        chunkFileNames: 'bundle/js/[name]-[hash].js',
        entryFileNames: 'bundle/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop() || ''
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'bundle/images/[name]-[hash][extname]'
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return 'bundle/fonts/[name]-[hash][extname]'
          }
          return 'bundle/[name]-[hash][extname]'
        }
      }
    },
    // No console removal for now - esbuild minification is sufficient
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 4173,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/data': resolve(__dirname, 'src/data'),
      '@/types': resolve(__dirname, 'src/types')
    }
  },
  optimizeDeps: {
    include: ['three']
  }
})
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'assets/images', dest: '' },
        { src: 'assets/files', dest: '' },
        { src: 'assets/fonts', dest: '' }
      ]
    })
  ],
  root: '.',
  base: '/',
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
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
          vendor: ['bootstrap'],
          animations: ['aos'],
          charts: ['chart.js'],
          three: ['three'],
          gsap: ['gsap', 'gsap/ScrollTrigger']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop() || ''
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
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
    include: ['bootstrap', 'aos', 'chart.js', 'three', 'gsap']
  }
})
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'assets/images', dest: 'assets' },
        { src: 'assets/files', dest: 'assets' }
      ]
    })
  ],
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'esbuild', // Use esbuild for faster builds
    target: 'es2015',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        '404': resolve(__dirname, '404.html'),
        about: resolve(__dirname, 'pages/about.html'),
        'beyond-the-code': resolve(__dirname, 'pages/beyond-the-code.html'),
        journey: resolve(__dirname, 'pages/journey.html'),
        projects: resolve(__dirname, 'pages/projects.html'),

        'wordle-solver': resolve(__dirname, 'pages/projects/wordle-solver.html'),
        'budgeting-automation': resolve(__dirname, 'pages/projects/budgeting-automation.html'),
        'basketball-optimization': resolve(__dirname, 'pages/projects/basketball-optimization.html'),
        'secret-santa': resolve(__dirname, 'pages/projects/secret-santa.html'),
        'lyric-animator': resolve(__dirname, 'pages/projects/lyric-animator.html'),

        'artifacts': resolve(__dirname, 'pages/artifacts.html'),
        'qr-code-generator': resolve(__dirname, 'pages/artifacts/qr-code-generator.html'),
        'uipath-queue-processor': resolve(__dirname, 'pages/artifacts/uipath-queue-processor.html'),
        'html-gems': resolve(__dirname, 'pages/artifacts/html-gems.html')
      },
      output: {
        manualChunks: {
          vendor: ['bootstrap'],
          animations: ['aos'],
          charts: ['chart.js']
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
    include: ['bootstrap', 'aos', 'chart.js']
  }
})
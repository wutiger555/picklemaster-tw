import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: true,
    // Inline assets smaller than 4KB to reduce HTTP requests
    assetsInlineLimit: 4096,
    // Use modern target for smaller bundles (browsers from 2020+)
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Split vendors finely so users only download what each page needs
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split three.js stack — drei alone is ~400KB, splitting helps cache & parallel load
          'vendor-three-core': ['three'],
          'vendor-three-fiber': ['@react-three/fiber'],
          'vendor-three-drei': ['@react-three/drei'],
          'vendor-framer': ['framer-motion'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          'vendor-gsap': ['gsap'],
          'vendor-lenis': ['@studio-freight/lenis'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    open: true,
  },
})

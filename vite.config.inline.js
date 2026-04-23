import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-inline',
    assetsInlineLimit: 10000000, // inline todo (10MB limit)
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      }
    }
  },
})

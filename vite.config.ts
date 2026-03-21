import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rutas relativas: imprescindible para GitHub Pages en subdirectorio
  // (https://user.github.io/repo-name/). Sin esto los dynamic imports de chunks
  // apuntan a /chunks/… en lugar de ./chunks/…
  base: './',
  build: {
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        // ES modules: permite dynamic import → chunks reales por step del wizard
        format: 'es',
        // Nombre fijo para el entry principal
        entryFileNames: 'imp-lux-ocp-style-selector.js',
        // Chunks lazy con hash para cache busting (WizardStep1, WizardStep2, bootstrap…)
        chunkFileNames: 'chunks/[name]-[hash].js',
        // CSS del bundle principal con nombre fijo; assets estáticos sin hash
        assetFileNames: 'imp-lux-ocp-style-selector.[ext]',
      },
    },
    // CSS dividido por chunk: cada step lazy obtiene su propio .css que Vite
    // inyecta automáticamente al cargar el chunk. Los ?inline bypasean esto.
    cssCodeSplit: false,
  },
})

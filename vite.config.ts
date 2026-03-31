import { defineConfig } from 'vitest/config'
import { resolve } from 'path';
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// @cfg.plat/fluid-product-urls/configure.js asigna `.name` directamente a funciones
// (methods[method].name = method). En strict mode (ESM) Function.name es non-writable,
// lo que lanza TypeError en runtime.
//
// Vite 8 usa Rolldown para build y para el pre-bundling de deps (optimizeDeps).
// `transform` opera en build; `optimizeDeps.rolldownOptions.plugins` cubre el
// pre-bundling (cachea en node_modules/.vite/deps/).
function patchFluidProductUrls(): Plugin {
  const BROKEN = 'methods[method].name = method;'
  const FIXED = 'try { Object.defineProperty(methods[method], "name", { value: method, configurable: true, writable: true }); } catch(e) {}'

  const patch = (code: string, id: string) => {
    if (!id.includes('fluid-product-urls/configure.js')) return
    return code.replace(BROKEN, FIXED)
  }

  return {
    name: 'patch-fluid-product-urls',
    transform: patch,
    config: () => ({
      optimizeDeps: {
        rolldownOptions: {
          plugins: [{ name: 'patch-fluid-product-urls-prebundle', transform: patch }]
        }
      }
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), patchFluidProductUrls()],
  // Rutas relativas: imprescindible para GitHub Pages en subdirectorio
  // (https://user.github.io/repo-name/). Sin esto los dynamic imports de chunks
  // apuntan a /chunks/… en lugar de ./chunks/…
  base: './',
  build: {
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        // ES modules: permite dynamic import → chunks reales por modo
        format: 'es',
        entryFileNames: 'imp-lux-ocp-style-selector.js',
        // Nombres fijos para bootstrap-configurator y bootstrap-wizard:
        // permiten modulepreload y rastreo de peso por modo.
        // El resto lleva hash para cache busting.
        chunkFileNames: (chunkInfo) => {
          const id = chunkInfo.facadeModuleId ?? ''
          if (id.includes('configurator/bootstrap')) return 'chunks/bootstrap-configurator.js'
          if (id.includes('products-index/bootstrap')) return 'chunks/bootstrap-index.js'
          if (id.includes('style-selector/bootstrap')) return 'chunks/bootstrap-wizard.js'
          if (chunkInfo.name === 'configurator-init') return 'chunks/configurator-init.js'
          return 'chunks/[name]-[hash].js'
        },
        assetFileNames: 'imp-lux-ocp-style-selector.[ext]',
        // Deps pesadas en chunks propios — se descargan solo cuando se necesitan
        manualChunks: (id) => {
          if (id.includes('node_modules/react-dom')) return 'react-dom'
          if (id.includes('node_modules/@cfg.plat/configure-core')) return 'configure-core'
          if (id.includes('node_modules/@fluid.inc/yr-configure-wrapper')) return 'yr-configure-wrapper'
          if (id.includes('node_modules/@fluid.inc/cmol-utils')) return 'cmol-utils'
        },
      },
    },
    cssCodeSplit: false,
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: [
      // jsonp-node.js es Node.js-only (usa fs + vm).
      // jsonp-client tiene browser:{"./jsonp-node.js":false} pero Rolldown lo ignora.
      // Regex necesario porque el require es relativo y Rolldown lo resuelve a ruta
      // absoluta antes de buscar aliases por string.
      {
        find: /.*jsonp-node(\.js)?$/,
        replacement: resolve(__dirname, 'src/stubs/jsonp-node.js'),
      },
      { find: '@', replacement: resolve(__dirname, 'src') },
    ]
  },
  define: {
    'process.browser': true,
    'process.env.FLUID_CONFIGURATIONS_VERSION': parseInt('3.13.0')
  }
})

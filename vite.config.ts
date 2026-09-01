import { defineConfig, type Connect, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'

// Standalone static pages in public/ (e.g. design-studio.html) are plain
// HTML, not React routes — this lets them be requested without the ".html"
// extension in dev/preview, matching how most static hosts serve them in
// production.
function serveExtensionlessHtml(routes: Record<string, string>): PluginOption {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const url = (req.url ?? '').split('?')[0]
    const target = url ? routes[url] : undefined
    if (!target) return next()
    const filePath = path.resolve(import.meta.dirname, 'public', target)
    if (!fs.existsSync(filePath)) return next()
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(fs.readFileSync(filePath))
  }
  return {
    name: 'serve-extensionless-html',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serveExtensionlessHtml({
      '/design-studio': 'design-studio.html',
      '/design-studio/kitchen': 'design-studio-kitchen.html',
      '/design-studio/wardrobe': 'design-studio-wardrobe.html',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})

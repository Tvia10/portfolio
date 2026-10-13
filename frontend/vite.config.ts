import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // En dev el front pega a /api y Vite lo reenvia al backend local,
    // asi no hay CORS ni URLs distintas entre dev y produccion.
    proxy: {
      // API_PROXY permite previsualizar contra otra API (ej. produccion).
      '/api': { target: process.env.API_PROXY ?? 'http://localhost:8000', changeOrigin: true },
    },
  },
})

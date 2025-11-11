import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT) || 5173,  // Use env var or default to 5173
    strictPort: false,  // If port is taken, try next available port
    host: true,         // Listen on all addresses (accessible from network)
  },
})

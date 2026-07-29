import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load env from parent directory (root .env) instead of client directory
  const env = loadEnv(mode, '../', '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(env._CLIENT_PORT) || 3001,
      host: true,
      allowedHosts: true,
    },
    preview: {
      port: parseInt(env._CLIENT_PORT) || 80,
      host: true,
      allowedHosts: true,
    },
  }
})

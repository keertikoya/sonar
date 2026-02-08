import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When your app calls '/serpapi/search.json', 
      // Vite redirects it to 'https://serpapi.com/search.json'
      '/serpapi': {
        target: 'https://serpapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/serpapi/, '')
      }
    }
  }
})
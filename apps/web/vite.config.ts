import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the site under /<repo>/
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
})

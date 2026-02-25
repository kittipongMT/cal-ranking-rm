import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use repo name as base path when deploying to GitHub Pages
const base = process.env.GITHUB_ACTIONS ? '/cal-ranking-rm/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
})

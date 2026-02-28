import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves this project from /WorkFlow_Portal/.
  base: command === 'serve' ? '/' : '/WorkFlow_Portal/',
}))

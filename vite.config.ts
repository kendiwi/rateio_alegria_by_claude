import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/rateio_alegria_by_claude/' : '/',
  server: {
    host: '::',
    port: 8080,
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: false,
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
}))

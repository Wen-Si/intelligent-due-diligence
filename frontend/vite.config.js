import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages配置
// 如果部署到GitHub Pages，需要设置base为仓库名
// 例如：https://username.github.io/intelligent-due-diligence/
// base应为 '/intelligent-due-diligence/'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/intelligent-due-diligence/' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios']
        }
      }
    }
  }
})
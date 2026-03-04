import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  base: '/helpdesk',
  plugins: [
    react(),
    federation({
      name: 'helpdeskService',
      filename: 'remoteEntry.js',
      exposes: { './App': './src/App' },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: { 
    port: 3006,
    proxy: {
      '/helpdesk/v1': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
  preview: { port: 3006 },
})

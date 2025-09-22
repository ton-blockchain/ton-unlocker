import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GH_PAGES ? '/ton-vesting-unlocker/' : './',
  plugins: [
    react(),
    nodePolyfills({
      // whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  build: {
    target: ['es2020'],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  server: {
    allowedHosts: ['c0d32de0b98b.ngrok-free.app', 'locker.ton.org', '1ixi1.github.io'],
  },
})

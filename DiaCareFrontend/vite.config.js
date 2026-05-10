import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@stomp/stompjs', 'sockjs-client'],
  },
})

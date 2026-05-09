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
<<<<<<< HEAD
=======
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@stomp/stompjs', 'sockjs-client'],
  },
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
})

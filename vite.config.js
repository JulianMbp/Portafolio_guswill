import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import string from 'vite-plugin-string';

export default defineConfig({
  plugins: [
    react(),
    string({
      include: '**/*.glsl' // permite importar archivos GLSL como texto
    })
  ]
})
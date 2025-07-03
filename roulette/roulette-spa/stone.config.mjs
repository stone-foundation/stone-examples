import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from '@stone-js/cli'

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss()
    ]
  }
})

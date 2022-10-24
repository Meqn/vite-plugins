import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import PageHtml from 'vite-plugin-page-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    PageHtml({
      page: {
        index: {
          entry: 'src/main.tsx',
          template: 'index.html',
          title: 'Vite + React App'
        },
        about: {
          entry: 'src/main.tsx',
          template: 'index.html',
          title: 'About (Vite + React)',
          inject: {
            tags: [
              {
                tag: 'h1',
                children: 'About Vite + React',
                injectTo: 'body-prepend'
              }
            ]
          }
        }
      }
    })
  ]
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pageHtml from 'vite-plugin-page-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    pageHtml({
      page: {
        index: {
          entry: 'src/main.ts',
          template: 'index.html',
          title: 'Vite + Vue App'
        },
        about: {
          entry: 'src/main.ts',
          template: 'index.html',
          title: 'About (Vite + Vue)',
          inject: {
            tags: [
              {
                tag: 'h1',
                children: 'About Vite + Vue',
                injectTo: 'body-prepend'
              }
            ]
          }
        }
      }
    })
  ]
})

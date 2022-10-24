import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import pageHtml from 'vite-plugin-page-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    pageHtml({
      page: 'index',
      inject: {
        tags: [
          {
            tag: 'h1',
            children: 'Hi, Svelte App!',
            injectTo: 'body-prepend'
          }
        ]
      }
    })
  ]
})

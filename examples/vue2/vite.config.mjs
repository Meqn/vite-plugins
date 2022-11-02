import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue2 from '@vitejs/plugin-vue2'

import pageHtml from 'vite-plugin-page-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2(),
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    pageHtml({
      template: 'public/template.html',
      title: 'Vite + Vue2 App',
      inject: {
        data: {
          styles: ['/style.css'],
          scripts: ['/script.js']
        }
      },
      page: {
        index: './src/main.js',
        'page/about': {
          entry: './src/pages/about.js',
          title: 'About (Vite + Vue2)',
          inject: {
            tags: [{
              tag: 'h1',
              attrs: {
                style: 'font-size: 3.6rem; margin-bottom: 2rem'
              },
              children: 'Hi, Vite + Vue2',
              injectTo: 'body-prepend'
            }]
          }
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

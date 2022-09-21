# vite-plugin-page-html

More flexible MPA (Multi-Page App) support for vite, like `html-webpack-plugin` for webpack.



## Install

```bash
npm install vite-plugin-page-html -D
```

## Usage

```js
// vite.config.js
import PageHtml from 'vite-plugin-page-html'

// @see https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // ... plugins
    PageHtml(/* options */)
  ]
})
```

## Options

```js
{
  ejsOptions: {},
  minify: false,
  data: {},
  page: {
    index: 'src/main.js',
    'product/index': {
      entry: 'src/product/main.js',
      template: 'src/product/index.html',
      title: 'Product Page'
    },
    'product/virtual': {
      entry: 'src/virtual/main.js',
      template: 'src/product/index.html',
      title: 'Virtual Product Page'
    },
    'product/real': {
      entry: 'src/real/main.js',
      template: 'src/product/index.html',
      title: 'Real Product Page'
    },
    task: {
      entry: 'src/task/main.js',
      template: 'index.html',
      title: 'Task Page'
    }
  }
}
```

After starting the dev server, browse:

- http://localhost:3000/index.html  
  Use `index.html` as the template and `src/main.js` as the entry.
- http://localhost:3000/product/index.html  
  Use `src/product/index.html` as the template and `src/product/main.js` as the entry.
- http://localhost:3000/product/virtual.html  
  Use `src/product/index.html` as the template and `src/virtual/main.js` as the entry.
- http://localhost:3000/product/real.html  
  Use `src/product/index.html` as the template and `src/real/main.js` as the entry.
- http://localhost:3000/task.html  
  Use `index.html` as the template and `src/task/main.js` as the entry.

The URL structure after the project is constructed is the same as that during development:

```
├── dist
│   ├── assets
│   ├── favicon.ico
│   ├── index.html
│   ├── product
│   │   ├── index.html
│   │   ├── real.html
│   │   └── virtual.html
│   └── task.html
```

For `MPA`, The `key` of `page` and the `build.rollupOptions.input` are associated with the following rules:

```js
{
  build: {
    rollupOptions: {
      input: {
        'index': path.resolve(__dirname, `index.html`),
        'product/index': path.resolve(__dirname, `src/product/index.html`),
        'product/virtual': path.resolve(__dirname, `src/product/index.html`),
        'product/real': path.resolve(__dirname, `src/product/index.html`),
        'task': path.resolve(__dirname, `index.html`)
      }
    }
  } 
}
```
# vite-plugin-page-html

**English** | [中文](./README.zh_CN.md)

More flexible MPA (Multi-Page App) support for vite, Similar to the [pages](https://cli.vuejs.org/config/#pages) option of vue-cli.

## Features

1. Multi-page/Single-page application support
2. Html entry alias (custom url)
3. Support custom `template`
4. Support custom `entry`
5. EJS template capability
6. External library import (CDN)
7. HTML compression capability

## Why ?

Although `Vite` supports multi-page applications natively, it requires html as entry, which means there must be these html.

If you put html in other directory, you need to add useless directories when accessing. There are also useless directories after build.

Although there are plug-ins that can solve these problems, but after using it, it can not satisfy my project, so I developed this plug-in `vite-plugin-page-html`.


## Install

- `node >= 14.x`
- `vite >= 2.x`

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
    PageHtml(/* Options */)
  ]
})
```

## Options

```typescript
PageHtml({
  page: string | PageConfig;
  entry?: string;
  template?: string;
  title?: string;
  data?: object;
  minify?: boolean | MinifyOptions;
  ejsOptions?: EjsOptions;
})
```

| property | default               | description |
| --------------- | ---- | ---- |
| `page`          | `index` | `requred` page configuration. If string, the value is the page path.<br>`PageConfig` [@See](#PageConfig)。 |
| `entry` | `src/main.js` | entry file |
| `template` | `index.html` | template file（`global`） |
| `title` | - | page title（`global`） |
| `data` | - | page data（`global`）Rendering via `ejs`<br>`<%= pageHtmlVitePlugin.data %>` |
| `minify` | `false` | Is compress html. `MinifyOptions` [@See](https://github.com/terser/html-minifier-terser#options-quick-reference) |
| `ejsOptions` | - | `ejs` options, [@See](https://github.com/mde/ejs#options) |

### PageConfig

```typescript
{
  [path: string]: string | PageOptions;
}
```

| property | default | description                                                  |
| -------- | ------- | ------------------------------------------------------------ |
| `path`   | -       | Single page configuration.<br>1. `path` as output. <br>2. If value is string, it is the entry file. <br>`PageOptions` [@See](#PageOptions)。 |

### PageOptions

```typescript
{
  entry: string;
  template?: string;
  title?: string;
  data?: object;
}
```

| property   | default      | description                                                  |
| ---------- | ------------ | ------------------------------------------------------------ |
| `entry`    | -            | `required` entry file                                        |
| `template` | `index.html` | template. Defaults is global `template`                      |
| `title`    | -            | title. Defaults is global `title`                            |
| `data`     | -            | page data（`global`）Rendering via `ejs`<br/>Merge global `data` by default.（`lodash.merge` ） |

## Examples

### Single-page App (SPA)

Single-page App configuration, Can specify access paths, entry and template.

```js
export default defineConfig({
  plugins: [
    // ... plugins
    PageHtml({
      page: 'user/index',
      entry: 'src/main.js'
      template: 'public/template.html',
      title: 'User Page',
      data: {},
      minify: false,
      ejsOptions: {}
    })
  ]
})
```

Starting the dev server, browse: `http://localhost:3000/user/index.html`

### Multi-page App (MPA)

Multi-page App configuration, Can specify access paths, entry and template.

> In multi-page mode, the data of each page will be automatically merged with the global `{ template, title, data }` . Merged via `lodash.merge`.

```js
export default defineConfig({
  plugins: [
    // ... plugins
    PageHtml({
      ejsOptions: {},
      minify: false,
      data: {},
      title: 'Vite App',
      page: {
        'index': 'src/main.js',
        'about': {
          entry: 'src/about/main.js',
          template: 'index.html',
          title: 'about Page'
        },
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
        }
      }
    })
  ]
})
```

After starting the dev server, browse:

- http://localhost:3000/index.html  
  Use `index.html` as the template and `src/main.js` as the entry.
- http://localhost:3000/about.html  
  Use `index.html` as the template and `src/about/main.js` as the entry.
- http://localhost:3000/product/index.html  
  Use `src/product/index.html` as the template and `src/product/main.js` as the entry.
- http://localhost:3000/product/virtual.html  
  Use `src/product/index.html` as the template and `src/virtual/main.js` as the entry.
- http://localhost:3000/product/real.html  
  Use `src/product/index.html` as the template and `src/real/main.js` as the entry.

The URL structure after the project is constructed is the same as that during development:

```
├── dist
│   ├── assets
│   ├── favicon.ico
│   ├── index.html
│   ├── about.html
│   ├── product
│   │   ├── index.html
│   │   ├── real.html
│   │   └── virtual.html
│   └──
```

For `MPA`, The `key` of `page` and the `build.rollupOptions.input` are associated with the following rules:

```js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'index': `index.html`,
        'about': `index.html`,
        'product/index': `src/product/index.html`,
        'product/virtual': `src/product/index.html`,
        'product/real': `src/product/index.html`,
      }
    }
  } 
})
```

## EJS render

`html` supports `ejs` syntax. Default data and custom data are automatically injected when each page is rendered.

1. Default data is written via `<%= BASE_URL %>` .
2. Custom data is written via `<%= pageHtmlVitePlugin.title %>`.
	
	> Custom data contains `{ entry, title, data } `

```js
// vite.config.js

export default defineConfig({
  plugins: [
    // ... plugins
    PageHtml({
      page: 'user/index',
      entry: 'src/main.js'
      template: 'public/template.html',
      title: 'User Page',
      data: {
        styles: [''],
        scripts: ['']
      }
    })
  ]
})
```

```html
// index.html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="<%= BASE_URL %>favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= pageHtmlVitePlugin.title %></title>

    <!-- import css -->
    <% for (var i in pageHtmlVitePlugin.data.styles) { %>
		<link rel="stylesheet" href="<%= pageHtmlVitePlugin.data.styles[i] %>" />
		<% } %>
  </head>
  <body>
    <div id="app"></div>
    <!-- production: import js -->
    <% if(PROD) { %>
      <% for (var i in pageHtmlVitePlugin.options.scripts) { %>
      <script type="text/javascript" src="<%= pageHtmlVitePlugin.data.scripts[i] %>"></script>
			<% } %>
		<% } else { %>
      <!-- 非生产环境 -->
      <script src="/path/to/development-only-script.js"></script>
		<% } %>
    
    <!-- 入口文件 -->
    <script type="module" src="<%= pageHtmlVitePlugin.entry %>"></script>
  </body>
</html>

```

### Default data

The object below is the default data of the render function. The data from `resolvedConfig.env`

```js
{
  BASE_URL: '/',
  MODE: 'development',
  DEV: true,
  PROD: false
}
```



## Externals

When we optimize the project build, we generally introduce commonly used external libraries through external links (CDN). This reduces build times and improves page load times in production.

Currently, `output.globals` is only used if `format` is `iife` or `umd`. If `format` is `es` and we want to map the external module to a global variable, we usually solve it with a third-party plugin.

I recommend [rollup-plugin-external-globals](https://github.com/eight04/rollup-plugin-external-globals) and [vite-plugin-externals](https://github.com/crcong/ vite-plugin-externals) .

Follow me, we combine `rollup-plugin-external-globals` to implement the production environment and import the cdn file.

```html
// index.html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= pageHtmlVitePlugin.title %></title>
    
    <% for (var i in pageHtmlVitePlugin.data.styles) { %>
    <link rel="stylesheet" href="<%= pageHtmlVitePlugin.data.styles[i] %>">
    <% } %>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="src/main.js"></script>
    <% if(PROD) { %>
      <% for (var i in pageHtmlVitePlugin.data.scripts) { %>
      <script src="<%= pageHtmlVitePlugin.data.scripts[i] %>"></script>
      <% } %>
    <% } %>
  </body>
</html>
```

```js
// vite.config.js

import { defineConfig } from 'vite'
import PageHtml from 'vite-plugin-page-html'
import externalGlobals from 'rollup-plugin-external-globals'

export default defineConfig({
  // ...
  plugins: [
    // ... plugins
    PageHtml({
      page: {
        'index': 'src/main.js',
        'about': {
          entry: 'src/about/main.js',
          title: 'about US'
        },
      },
      template: 'public/template.html',
      data: {
        styles: [
          'https://cdn.jsdelivr.net/npm/element-ui@2.15.10/lib/theme-chalk/index.css'
        ],
        scripts: [
          'https://cdn.jsdelivr.net/npm/vue@2.7.10/dist/vue.min.js',
          'https://cdn.jsdelivr.net/npm/element-ui@2.15.10/lib/index.js',
          'https://cdn.jsdelivr.net/npm/axios@0.24.0/dist/axios.min.js'
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      plugins: [
        externalGlobals({
          'vue': 'Vue',
          'axios': 'axios',
          'element-ui': 'ELEMENT',
        })
      ]
    }
  }
})
```

## Thanks

[vite.js](https://github.com/vitejs/vite) 、 [ejs]() 、[html-minifier-terser](https://github.com/terser/html-minifier-terser) 



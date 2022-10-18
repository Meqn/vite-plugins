# vite-plugin-page-html

**中文** | [English](https://github.com/Meqn/vite-plugins/blob/main/packages/page-html/README.md)

简单灵活的 MPA（多页面应用）Vite插件。支持html模板和访问路径重写，类似于`vue-cli` 的[pages选项](https://cli.vuejs.org/en/config/#pages) 。

## Features

* 📚 单页面(SPA)和多页面(MPA)模式
* 📡 支持页面入口别名 (`自定义访问路径`)
* 📊 支持自定义 `template`
* 🔑 支持自定义 `entry`
* 🗳 支持 Ejs 模板语法
* 🔗 支持外部文件库引入 (CDN)
* 🗜 支持HTML文件压缩能力

## Why ?

虽然 Vite [原生支持多页应用](https://vitejs.dev/guide/build.html#multi-page-app)，但它需要以html作为入口文件，这意味着必须有这些html文件。

如果将html文件放置其他目录，那么在访问时需要添加多余的中间目录。与此同时在打包后的文件目录也存在多余的中间目录。

虽然目前也有一些Vite插件能够解决这些问题，但使用后并不能满足我之前的项目，所以便有了这个插件 `vite-plugin-page-html`。


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
| `page`          | `index` | `requred` 页面配置项。若为string，则值为页面path。`PageConfig` [详见](#PageConfig)。 |
| `entry` | `src/main.js` | 页面入口文件 |
| `template` | `index.html` | 模板（`global`） |
| `title` | - | 标题（`global`） |
| `data` | - | 页面数据（`global`），通过`ejs`渲染。`<%= pageHtmlVitePlugin.data %>` |
| `minify` | `false` | 是否压缩html，`MinifyOptions` [详见](https://github.com/terser/html-minifier-terser#options-quick-reference) |
| `ejsOptions` | - | `ejs` 配置项, [详见](https://github.com/mde/ejs#options) |

### PageConfig

```typescript
{
  [path: string]: string | PageOptions;
}
```

| property | default | description                                                  |
| -------- | ------- | ------------------------------------------------------------ |
| `path`   | -       | 单个页面配置项。<br>1. `path` 将作为输出路径<br>2. `path`的值若为string，则为入口文件。<br>`PageOptions` [详见](#PageOptions)。 |

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
| `entry`    | -            | `required` 页面入口文件                                      |
| `template` | `index.html` | 模板，默认为全局`template`                                   |
| `title`    | -            | 标题，默认为全局`title`                                      |
| `data`     | -            | 页面数据，通过`ejs`渲染，<br/>默认合并全局`data`，（`lodash.merge` 合并方式） |

## Examples

### Single-page App (SPA)

单页配置，可随意指定访问路径、入口和模板

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

多页配置，可随意指定访问路径、入口和模板

> 注意，多页面模式下，每个页面的配置数据会自动合并全局的 `{ template, title, data }` 数据。`data` 通过 `lodash.merge` 方式合并。

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
          entry: 'src/product/virtual/main.js',
          template: 'src/product/index.html',
          title: 'Virtual Product Page'
        },
        'product/real': {
          entry: 'src/product/real/main.js',
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
  Use `src/product/index.html` as the template and `src/product/virtual/main.js` as the entry.
- http://localhost:3000/product/real.html  
  Use `src/product/index.html` as the template and `src/product/real/main.js` as the entry.

项目构建后的URL结构与开发时相同：

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

 `MPA` 模式下，`page` 的 `key` 和 `build.rollupOptions.input` 与之对应：

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

`html` 文件支持 `ejs` 模板语法。每个页面在渲染时都会自动注入 默认数据 和 自定义数据。

1. 默认数据 通过 `<%= BASE_URL %>` 方式写入。
2. 自定义数据 通过 `<%= pageHtmlVitePlugin.title %>` 方式写入。
	
	> 自定义数据包含 `{ entry, title, data } `

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
        styles: '',
        scripts: ''
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
  <title>
  <%= pageHtmlVitePlugin.title %>
  </title>

  <!-- 引入css文件 -->
  <link rel="stylesheet" href="<%= pageHtmlVitePlugin.data.styles[i] %>" />
</head>

<body>
  <div id="app"></div>
  <!-- 生产环境 引入js文件 -->
  <% if(PROD) { %>
    <script src="<%= pageHtmlVitePlugin.data.scripts[i] %>"></script>
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

我们在优化项目打包时，一般会将常用的外部库通过外链的方式引入（CDN）。这可以减少构建时间，并且提高生产环境中页面加载速度。

目前 `rollup` 的 `output.globals` 仅在`format` 是 `iife` 或 `umd` 时有效。如果`format` 是 `es` 时就需要通过第三方插件将外部模块映射到全局变量。

我比较推荐 [rollup-plugin-external-globals](https://github.com/eight04/rollup-plugin-external-globals) 和 [vite-plugin-externals](https://github.com/crcong/vite-plugin-externals) 这两款插件。

下面结合 `rollup-plugin-external-globals` 实现生产环境引入cdn文件库。

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
          title: '关于我们'
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



# vite-plugin-minify-html

Use `html-minifier-terser` to minimize html for vite.

## Useage

```js
// vite.config.ts
import minifyHtml from 'vite-plugin-minify-html'

export default defineConfig({
  plugins: [
    minifyHtml({
      minify: true,
      filter: 'index.html'
    }),
  ],
})
```

## Options

| Parameter | Type                                              | Default | Description        |
| --------- | ------------------------------------------------- | ------- | ------------------ |
| minify    | `boolean｜MinifyOptions`                          | `true`  | html minify option |
| filter    | `RegExp｜string｜((fileName: string) => boolean)` | -       | target file filter |

### `minify`

- Type: `boolean | MinifyOptions`

- Default: `true`

```js
{
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
}
```

`MinifierOptions` is same as [html-minifier-terser options](https://github.com/terser/html-minifier-terser#options-quick-reference).

### `filter`

- Type: `RegExp | string | ((fileName: string) => boolean)`
- Default: None (All entry point files will be matched)



## Thanks
[html-minifier-terser](https://github.com/terser/html-minifier-terser) , [vite-plugin-html](https://github.com/vbenjs/vite-plugin-html)


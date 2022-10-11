import {
  minify as minifyFn,
  type Options as MinifyOptions
} from 'html-minifier-terser'

export type Filter = RegExp | string | ((fileName: string) => boolean)
export type PluginOptions = {
  minify?: boolean | MinifyOptions
  filter?: Filter
}

export function filterFileName(
  fileName: string,
  filter: Filter | undefined
): boolean {
  if (filter instanceof RegExp) {
    return filter.test(fileName)
  }
  if (typeof filter === 'function') {
    return filter(fileName)
  }
  if (typeof filter === 'string') {
    return fileName === filter
  }
  return true
}

export function getOptions(minify: boolean | MinifyOptions): MinifyOptions {
  if (typeof minify === 'boolean') {
    return {
      collapseWhitespace: minify,
      keepClosingSlash: minify,
      removeComments: minify,
      removeRedundantAttributes: minify,
      removeScriptTypeAttributes: minify,
      removeStyleLinkTypeAttributes: minify,
      useShortDoctype: minify,
      minifyCSS: minify
    }
  }
  return minify
}

export async function minifyHtml(
  html: string,
  minify: boolean | MinifyOptions
) {
  if (typeof minify === 'boolean' && !minify) return html

  const minifyOptions = getOptions(minify)
  return await minifyFn(html, minifyOptions)
}

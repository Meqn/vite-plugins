import { type Plugin } from 'vite'

import { PluginOptions, filterFileName, minifyHtml } from './utils'
import { name as PluginName } from 'package.json'

export function createMinifyHtmlPlugin(options: PluginOptions = {}): Plugin {
  const { minify = true, filter } = options
  return {
    name: PluginName,
    enforce: 'post',
    apply: 'build',
    transformIndexHtml: (html, { filename }) => {
      if (!filterFileName(filename, filter)) return

      return minifyHtml(html, minify)
    }
  }
}

export default createMinifyHtmlPlugin

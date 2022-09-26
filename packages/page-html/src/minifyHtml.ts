import type { PluginOption } from 'vite'
import { htmlFilter, minifyHtml } from './utils'
import type { PagesOptions } from './types'

export function createMinifyHtmlPlugin({
  minify
}: PagesOptions = {}): PluginOption {
  return {
    name: 'vite-plugin-minify-html',
    // apply: 'build',
    enforce: 'post',
    async generateBundle(_, outputBundle) {
      if (minify) {
        // 遍历 bundle
        for (const bundle of Object.values(outputBundle)) {
          // 确定 html文件
          if (
            bundle.type === 'asset' &&
            htmlFilter(bundle.fileName) &&
            typeof bundle.source === 'string'
          ) {
            bundle.source = await minifyHtml(bundle.source, minify)
          }
        }
      }
    }
  }
}

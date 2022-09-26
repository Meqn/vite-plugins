import type { PluginOption } from 'vite'
import type { PagesOptions } from './types'
import { createPageHtmlPlugin } from './pageHtml'
import { createMinifyHtmlPlugin } from './minifyHtml'

export default function createPlugin(
  pluginOptions: PagesOptions = {}
): PluginOption[] {
  return [
    createPageHtmlPlugin(pluginOptions),
    createMinifyHtmlPlugin(pluginOptions)
  ]
}

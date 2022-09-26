import { PluginOption } from 'vite'
import { PagesOptions } from './types'
import { createPlugin } from './page'

export default function createPageHtmlPlugin(
  pluginOptions: PagesOptions = {}
): PluginOption[] {
  return [createPlugin(pluginOptions)]
}

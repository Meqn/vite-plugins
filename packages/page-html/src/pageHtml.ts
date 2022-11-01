import type { ResolvedConfig, PluginOption } from 'vite'
import historyFallback from 'connect-history-api-fallback'

import { PagesOptions, PageData, PagesData } from './types'
import {
  errlog,
  createPage,
  createRewrites,
  compileHtml,
  cleanUrl,
  cleanPageUrl,
  createVirtualHtml,
  removeVirtualHtml
} from './utils'
import { name as PLUGIN_NAME } from '../package.json'

type PageListItem = {
  name: string
  path: string
  template: string
}

export function createPageHtmlPlugin(
  pluginOptions: PagesOptions = {}
): PluginOption {
  let pageInput: Record<string, string> = {}
  let pageList: PageListItem[] = []
  let viteConfig: ResolvedConfig
  // EJS render
  let renderHtml: (html: string, data?: PageData) => string | Promise<string>
  // 创建的临时入口 html
  let needRemoveVirtualHtml: string[]

  const pages: PagesData = createPage(pluginOptions)

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    async config(config, { command }) {
      Object.keys(pages).forEach(name => {
        const current: PageData = pages[name]
        const template = command === 'build' ? `${current.path}.html` : current.template
        pageInput[name] = template
        pageList.push({ name, path: current.path, template: template })
      })

      if (!config.build?.rollupOptions?.input) {
        return { build: { rollupOptions: { input: pageInput } } }
      } else {
        config.build.rollupOptions.input = pageInput
      }
    },

    async configResolved(resolvedConfig) {
      viteConfig = resolvedConfig

      if (resolvedConfig.command === 'build') {
        needRemoveVirtualHtml = await createVirtualHtml(pages, resolvedConfig.root)
      }

      // resolvedConfig.env = { BASE_URL, MODE, DEV, PROD }
      renderHtml = compileHtml(
        pluginOptions.ejsOptions,
        { ...resolvedConfig.env },
        resolvedConfig
      )
    },

    configureServer(server) {
      // @description rewrite request url
      // @see https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/htmlFallback.ts
      server.middlewares.use(
        historyFallback({
          verbose: !!process.env.DEBUG && process.env.DEBUG !== 'false',
          disableDotRule: undefined,
          htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
          rewrites: createRewrites(pages, viteConfig.base ?? '/')
        })
      )
    },

    transformIndexHtml: {
      enforce: 'pre',
      async transform(html: string, ctx) {
        try {
          // 页面路径, (originalUrl: 'serve模式', path: 'build模式')
          const pageUrl =
            cleanPageUrl(
              cleanUrl(decodeURIComponent(ctx.originalUrl ?? ctx.path))
            ) || 'index'
          // url 完全匹配 及 过滤 `/index`
          const current = pageList.find(
            item => item.path === pageUrl || item.path === `${pageUrl}/index`
          )
          if (current) {
            const pageData = pages[current.name]
            const _html = await renderHtml(html, pageData)
            const { tags = [] } = pageData.inject
            return {
              html: _html,
              tags
            }
          } else {
            throw Error(`${ctx.originalUrl ?? ctx.path} not found!`)
          }
        } catch (e) {
          const msg = (<Error>e).message
          errlog(msg)
          return msg
        }
      }
    },

    closeBundle() {
      if (needRemoveVirtualHtml.length > 0) {
        removeVirtualHtml(needRemoveVirtualHtml)
      }
    }
  }
}

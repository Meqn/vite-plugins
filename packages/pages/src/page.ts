import { normalizePath, Plugin, ViteDevServer } from 'vite'

import { PagesOptions, PageData, PagesData } from './types'
import {
  resolve,
  errlog,
  generatePage,
  compileHtml,
  readHtml,
  cleanUrl,
  getPageName,
  createVirtualHtml,
  removeVirtualHtml
} from './utils'
import { name as PLUGIN_NAME } from '../package.json'

type PageListItem = {
  name: string
  template: string
}
type PageEntry = {
  [key: string]: string
}

export function createPlugin(pluginOptions: PagesOptions | undefined): Plugin {
  if (!pluginOptions)
    return {
      name: PLUGIN_NAME
    }

  let pageEntry: PageEntry = {}
  let pageList: PageListItem[] = []
  // EJS模板编译
  let template: (html: string, data?: PageData) => string | Promise<string>
  // build模式下临时入口 html
  let needRemoveVirtualHtml: string[]

  const pages: PagesData = generatePage(pluginOptions)

  return {
    name: PLUGIN_NAME,
    async config(config, { command }) {
      Object.keys(pages).forEach(name => {
        const current: PageData = pages[name]
        current.rawTemplate = normalizePath(
          resolve(config.root || '', current.template)
        )
        current.template =
          command === 'build'
            ? normalizePath(resolve(config.root || '', `${current.path}.html`))
            : current.rawTemplate
        current.entry = normalizePath(resolve(config.root || '', current.entry))

        pageEntry[name] = current.template
        pageList.push({ name, template: current.template })
      })

      if (command === 'build') {
        await createVirtualHtml(pages, config.root).then(list => {
          needRemoveVirtualHtml = list
        })
      }

      if (!config.build?.rollupOptions?.input) {
        return { build: { rollupOptions: { input: pageEntry } } }
      } else {
        config.build.rollupOptions.input = pageEntry
      }
    },

    configResolved(resolvedConfig) {
      // resolvedConfig.env = { BASE_URL, MODE, DEV, PROD }
      template = compileHtml(pluginOptions.ejsOptions, {
        ...resolvedConfig.env
      })
    },

    configureServer(server: ViteDevServer) {
      return () => {
        // serve模式下页面匹配
        server.middlewares.use(async (req, res, next) => {
          const url = cleanUrl(decodeURI(req.originalUrl || req.url || ''))
          const pageName = getPageName(url.split('.html')[0]) || 'index'

          const current = pages[pageName]
          const pageUrl = pageEntry[pageName] // url匹配页面
          const pageUrlIndex = pageEntry[`${pageName}Index`] // url匹配的默认首页

          if (pageUrl) {
            // 匹配的页面
            const content = await readHtml(pageUrl)
            return res.end(template(content, current))
          } else if (!pageUrl && pageUrlIndex) {
            // 匹配默认页面
            const content = await readHtml(pageUrlIndex)
            return res.end(template(content, pages[`${pageName}Index`] || {}))
          } else {
            next()
          }
        })
      }
    },

    transformIndexHtml: {
      enforce: 'pre',
      transform(html: string, ctx) {
        // 存在html页面
        try {
          const url = decodeURI(ctx.path)?.split('?')[0]
          const current = pageList.find(item => item.template.endsWith(url))
          return template(html, current ? pages[current.name] : undefined)
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

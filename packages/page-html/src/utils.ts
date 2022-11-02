import { resolve } from 'pathe'
import { error as errorLog, colors } from 'diy-log'
import ejs from 'ejs'
import fs from 'fs-extra'
import { type ResolvedConfig } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import {
  type Options as MinifyOptions,
  minify as minifyFn
} from 'html-minifier-terser'

import {
  PageData,
  PagesOptions,
  PagesData,
  EjsOptions,
  EjsExtendData
} from './types'

import { name as PLUGIN_NAME } from '../package.json'

export function errlog(...args: string[]): void {
  errorLog(`[${colors.gray(PLUGIN_NAME)}] `, ...args)
}

export const htmlFilter = createFilter(['**/*.html'])

/**
 * 清除 url 的 `search`和`hash`
 * @param url url地址
 * @returns url
 */
export function cleanUrl(url: string) {
  if (!url) return '/'
  const queryRE = /\?.*$/s
  const hashRE = /#.*$/s
  return url.replace(hashRE, '').replace(queryRE, '')
}

/**
 * 清除页面路径 前后的 `/`和`.html`
 * @param path 路径
 * @returns path
 */
export function cleanPageUrl(path: string): string {
  return path.replace(/(^\/)|(\/$)/g, '').replace(/\.htm(l)?$/i, '')
}

export async function readHtml(path: string): Promise<string> {
  try {
    return await fs.readFile(path, { encoding: 'utf-8' })
  } catch (e) {
    errlog((<Error>e).message)
    return (<Error>e).message
  }
}

/**
 * 合并数据并返回 Ejs 渲染函数
 * @param ejsOptions Ejs配置
 * @param extendData 公共数据
 * @returns render function (自动挂载 entry)
 */
export function compileHtml(
  ejsOptions: EjsOptions = {},
  extendData: EjsExtendData = {},
  viteConfig: ResolvedConfig
) {
  const bodyInjectRE = /<\/body>/

  return async function (html: string, data?: PageData): Promise<string> {
    try {
      const ejsData = {
        ...extendData,
        pageHtmlVitePlugin: {
          title: data?.title,
          entry: data?.entry,
          data: data?.inject.data
        }
      }
      let result = await ejs.render(html, ejsData, ejsOptions)

      if (data?.entry) {
        // 在这里需要移除 html的 entry: <script type="module">
        result = result.replace(
          bodyInjectRE,
          `<script type="module" src="${resolve(
            viteConfig.base ?? '/',
            data.entry
          )}"></script>\n</body>`
        )
      }

      return result
    } catch (e) {
      errlog((<Error>e).message)
      return ''
    }
  }
}

/**
 * 通过页面路径生成页面名称 (小驼峰格式化)
 * @param path 路径
 * @returns 
 */
 export function createPageName(path: string): string {
  const paths = path.split('/')
  if (paths.length > 1) {
    return paths.reduce((res, p) => {
      return res === '' ? p : (res + p.charAt(0).toUpperCase() + p.slice(1))
    }, '')
  } else {
    return path
  }
}

/**
 * @description 通过配置项生成所需要的页面数据
 * @param options {PagesOptions} 配置项
 * @returns PagesData
 */
export function createPage(options: PagesOptions = {}): PagesData {
  const {
    page = 'index',
    entry = 'src/main.js',
    template = 'index.html',
    title = 'Vite App',
    data = {},
    minify = false,
    ejsOptions = {},
    inject = {}
  } = options

  const defaults = {
    entry,
    template,
    title,
    minify,
    ejsOptions,
    inject: {
      data: inject.data ?? data, // ⚠️ warning: 新版本待移除 data
      tags: inject.tags ?? []
    }
  }
  const pages: Record<string, any> = {}

  if (typeof page === 'string') {
    const _page = cleanPageUrl(page)
    const pageName = createPageName(_page)
    pages[pageName] = {
      ...defaults,
      path: _page
    }
  } else {
    Object.keys(page).forEach(name => {
      const pageItem = page[name]
      const _page = cleanPageUrl(name)
      const pageName = createPageName(_page)

      if (!pageItem || (typeof pageItem !== 'string' && !pageItem.entry)) {
        errlog(`not found ${name} page`)
        return
      }

      if (typeof pageItem === 'string') {
        pages[pageName] = {
          ...defaults,
          path: _page,
          entry: pageItem
        }
      } else {
        // ⚠️ warning: 新版本待移除 data
        const {
          inject: { data: injectData, tags: injectTags }
        } = defaults

        pages[pageName] = Object.assign({}, defaults, pageItem, {
          path: _page,
          inject: {
            data: pageItem.inject?.data ?? pageItem.data ?? injectData,
            tags: pageItem.inject?.tags ?? injectTags
          }
        })
      }
    })
  }

  return pages
}

/**
 * ViteDevServer 请求地址重写 (请求地址完全匹配)
 * @param pages 所有页面
 * @param baseUrl BASE_URL
 * @returns rewrite rules
 */
export function createRewrites(pages: PagesData, baseUrl: string) {
  const rewrites: { from: RegExp; to: any }[] = []
  Object.keys(pages).forEach(name => {
    const page = pages[name]
    const indexReg = /(\S+)(\/index\/?)$/

    // 1. 支持 `xxx`, `xxx/xxx`, `xxx[?/xxx].html`, `xxx[?/index.html]` 请求
    rewrites.push({
      from: new RegExp(
        `\^\/${page.path}((\/)|(\\.html?)|(\/index\\.html?))?$`,
        'i'
      ),
      to({ parsedUrl }: any) {
        return resolve(baseUrl, page.template)
      }
    })
    // 2. 支持 `xxx[?/xxx]/index` 通过 `xxx[?/xxx]` 请求
    if (indexReg.test(page.path)) {
      const _path = page.path.replace(indexReg, '$1')
      rewrites.push({
        from: new RegExp(`\^\/${_path}(\/)?$`, 'i'),
        to({ parsedUrl }: any) {
          return resolve(baseUrl, page.template)
        }
      })
    }
  })
  // 3. 支持 `/` 请求
  rewrites.push({
    from: /^\/$/,
    to({ parsedUrl }: any) {
      const page = pages['index']
      if (page) {
        return resolve(baseUrl, page.template)
      }
      return '/'
    }
  })
  return rewrites
}

// 检测路径是否存在,并记录
async function checkExistOfPath(p: string, root: string): Promise<string> {
  let result = ''
  try {
    if (p === '.' || p === './') return result

    const paths = p.replace(root, '').split('/')

    if (paths[0] === '') {
      paths.splice(0, 1)
    }

    if (paths.length === 0) return ''

    for (let i = 0, len = paths.length; i < len; i++) {
      result = resolve(root, ...paths.slice(0, i + 1))
      await fs.access(result, fs.constants.F_OK)
    }

    return result
  } catch (e) {
    // errlog((<Error>e).message)
    return result
  }
}

async function copyOneFile(
  src: string,
  dest: string,
  root: string
): Promise<string> {
  try {
    const result = await checkExistOfPath(dest, root)
    await fs.copy(src, dest, {
      overwrite: false,
      errorOnExist: true
    })
    return result
  } catch (e) {
    // errlog((<Error>e).message)
    return ''
  }
}

export function createVirtualHtml(
  pages: PagesData,
  root?: string
): Promise<string[]> {
  const _root = root ?? process.cwd()
  return Promise.all<Promise<string>>(
    Object.keys(pages).map((name: string) => {
      const page = pages[name]
      return copyOneFile(
        resolve(_root, page.template),
        resolve(_root, `${page.path}.html`),
        _root
      )
    })
  )
}

export async function removeVirtualHtml(files: string[]): Promise<void> {
  try {
    if (!files || files.length === 0) return

    const _files = Array.from(new Set(files.filter(f => !!f)))
    for (let file of _files) {
      await fs.remove(file)
    }
  } catch (e) {
    errlog((<Error>e).message)
  }
}

function minifyOptions(options: true | MinifyOptions): MinifyOptions {
  const opts = options === true ? {} : options
  return {
    collapseWhitespace: true,
    keepClosingSlash: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    ...opts
  }
}

export async function minifyHtml(
  html: string,
  minify: boolean | MinifyOptions
) {
  if (typeof minify === 'boolean' && !minify) {
    return html
  }
  return await minifyFn(html, minifyOptions(minify))
}

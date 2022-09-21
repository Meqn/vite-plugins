import path from 'path'
import lodash from 'lodash'
import logger from 'diy-log'
import ejs from 'ejs'
import fs from 'fs-extra'
import { normalizePath } from 'vite'

import {
  Obj,
  PageData,
  PagesOptions,
  PagesData,
  EjsOptions,
  EjsExtendData
} from './types'

import { name as PLUGIN_NAME } from '../package.json'

export const cwd: string = normalizePath(process.cwd())
export const resolve = (...args: string[]): string => path.resolve(cwd, ...args)

export function errlog(...args: string[]): void {
  logger.error(`[${logger.colors.gray(PLUGIN_NAME)}] `, ...args)
}

export function getPageName(path: string): string {
  const _path = path.startsWith('/') ? path.slice(1) : path
  return lodash.camelCase(_path.split('/').join('_'))
}

export function cleanUrl(url: string) {
  if (!url) return '/'
  const queryRE = /\?.*$/s
  const hashRE = /#.*$/s
  return url.replace(hashRE, '').replace(queryRE, '')
}

export async function readHtml(path: string): Promise<string> {
  try {
    return await fs.readFile(path, { encoding: 'utf-8' })
  } catch (e) {
    errlog((<Error>e).message)
    return (<Error>e).message
  }
}

export function compileHtml(
  ejsOptions: EjsOptions = {},
  extendData: EjsExtendData = {}
) {
  return function (html: string, data?: PageData): string | Promise<string> {
    try {
      const pluginData = {
        ...extendData,
        pageHtmlVitePlugin: data || {}
      }
      return ejs.render(html, pluginData, ejsOptions)
    } catch (e) {
      errlog((<Error>e).message)
      return ''
    }
  }
}

export function generatePage(options: PagesOptions): PagesData {
  const {
    page = 'index',
    entry = '/src/main.js',
    template = 'index.html',
    title = 'Vite App',
    data = {},
    minify = false,
    ejsOptions = {}
  } = options

  const defaults = { entry, template, title, data, minify, ejsOptions }
  const pages: Obj = {}

  if (typeof page === 'string') {
    const pageName = getPageName(page)
    pages[pageName] = {
      ...defaults,
      path: page
    }
  } else {
    Object.keys(page).forEach(item => {
      const pageName = getPageName(item)
      const pageItem = page[item]

      if (!pageItem || (typeof pageItem !== 'string' && !pageItem.entry)) {
        errlog(`not found ${item} page`)
        return
      }

      if (typeof pageItem === 'string') {
        pages[pageName] = {
          ...defaults,
          path: item,
          entry: pageItem
        }
      } else {
        pages[pageName] = lodash.merge({}, defaults, {
          ...pageItem,
          path: item
        })
      }
    })
  }

  return pages
}

// 检测路径是否存在,并记录
async function checkExistOfPath(p: string): Promise<string> {
  let result = ''
  try {
    if (p === '.' || p === './') return result

    const paths = p.split('/')
    if (paths[0] === '.') {
      paths.splice(0, 1)
    } else if (paths[0] === '') {
      paths[0] = '/'
    }

    for (let i = 0, len = paths.length; i < len; i++) {
      result = resolve(...paths.slice(0, i + 1))
      await fs.access(result, fs.constants.F_OK)
    }

    return result
  } catch (e) {
    errlog((<Error>e).message)
    return result
  }
}

async function copyOneFile(src: string, dest: string): Promise<string> {
  try {
    const result = await checkExistOfPath(dest)
    await fs.copy(resolve(src), resolve(dest), {
      overwrite: false,
      errorOnExist: true
    })
    return result
  } catch (e) {
    errlog((<Error>e).message)
    return ''
  }
}

export function createVirtualHtml(
  pages: PagesData,
  root: string = ''
): Promise<string[]> {
  return Promise.all<Promise<string>>(
    Object.keys(pages).map((name: string) => {
      const page = pages[name]
      const vHtml = normalizePath(resolve(root, `${page.path}.html`))
      return copyOneFile(page.rawTemplate, vHtml)
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

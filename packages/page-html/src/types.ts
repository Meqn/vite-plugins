import type { HtmlTagDescriptor } from 'vite'
import { Options as _EjsOptions } from 'ejs'
import type { Options as MinifyOptions } from 'html-minifier-terser'

export type EjsOptions = _EjsOptions

interface InjectOptions {
  /**
   * @see https://cn.vitejs.dev/guide/api-plugin.html#vite-specific-hooks
   */
  tags?: HtmlTagDescriptor[],
  
  /**
   * @description use for template.
   * @description multi-page app (MPA) mode, the data will be merged into each page by `lodash.merge`.
   */
   data?: Record<string, any>
}

// single page config
export interface PageConfig {
  entry: string
  template?: string
  title?: string
  minify?: boolean
  ejsOptions?: EjsOptions
  inject?: InjectOptions
  [key: string]: any // ⚠️ warning: 新版本待移除, 兼容data
}

export interface PageData extends PageConfig {
  path: string
  template: string
  inject: InjectOptions
}

export interface PagesData {
  [key: string]: PageData
}

export interface EjsExtendData {
  BASE_URL?: string
  MODE?: string
  DEV?: boolean
  PROD?: boolean
  [key: keyof any]: any
}

export interface PagesOptions {
  /**
   * @description page’s configuration.
   * @summary If string, the value is the page path (SPA)
   * @type {string | { path: PageConfig }}
   */
  page?:
    | string
    | {
        [key: string]: string | PageConfig
      }

  /**
   * @description entry for the page (SPA)
   * @type {string}
   */
  entry?: string

  /**
   * @description the source template. as global html template
   * @type {string}
   */
  template?: string

  /**
   * @description page title. as global title
   * @summary when using title option, template title tag needs to be <title><%= pageHtmlVitePlugin.title %></title>
   * @type {string}
   */
  title?: string

  /**
   * @description compressed html file?
   * @type {boolean}
   */
  minify?: boolean | MinifyOptions

  /**
   * @description esj options configuration
   * @type {EjsOptions}
   * @see https://github.com/mde/ejs#options
   */
  ejsOptions?: EjsOptions

  /**
   * @description inject options
   */
  inject?: InjectOptions
  
  // ⚠️ warning: 新版本待移除, 兼容 data
  [key: string]: any
}

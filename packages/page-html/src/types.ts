import type { HtmlTagDescriptor } from 'vite'
import { Options as _EjsOptions } from 'ejs'
import type { Options as MinifyOptions } from 'html-minifier-terser'

export type EjsOptions = _EjsOptions

interface InjectOptions {
  /**
   * @see https://cn.vitejs.dev/guide/api-plugin.html#vite-specific-hooks
   */
  tags?: HtmlTagDescriptor[]
}

// single page config
export interface PageConfig {
  entry: string
  template?: string
  title?: string
  data?: {
    [key: keyof any]: any
  }
  minify?: boolean
  ejsOptions?: EjsOptions
  inject?: InjectOptions
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
   * @description use for template. as global inject data
   * @summary multi-page app (MPA) mode, the data will be merged into each page by `lodash.merge`.
   */
  data?: Record<string, any>

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
}

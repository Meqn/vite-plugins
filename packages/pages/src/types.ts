import { Options as _EjsOptions } from 'ejs'

export type EjsOptions = _EjsOptions

export interface Obj {
  [key: keyof any]: any
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
}
export interface PageData extends PageConfig {
  path: string
  template: string
  rawTemplate: string
}

export interface PagesOptions {
  /**
   * page’s configuration.
   * If string, the value is the page path (SPA)
   * @type {string | { path: PageConfig }}
   */
  page:
    | string
    | {
        [key: string]: string | PageConfig
      }

  /**
   * entry for the page (SPA)
   * @type {string}
   */
  entry?: string

  /**
   * the source template. as global html template
   * @type {string}
   */
  template?: string

  /**
   * page title. as global title
   * when using title option,
   * template title tag needs to be <title><%= pageHtmlVitePlugin.title %></title>
   * @type {string}
   */
  title?: string

  /**
   * use for template. as global inject data
   * In multi-page app (MPA) mode, the data will be merged into each page by `lodash.merge`.
   * @type {Obj}
   */
  data?: {
    [key: string]: any
  }

  /**
   * Is compressed html file?
   * @type {boolean}
   */
  minify?: boolean

  /**
   * ejs options
   * @see https://github.com/mde/ejs#options
   * @type {EjsOptions}
   */
  ejsOptions?: EjsOptions
}

export interface PagesData {
  [key: string]: PageData
}

export interface EjsExtendData {
  BASE_URL?: string
  MODE?: string
  DEV?: boolean
  PROD?: boolean
}

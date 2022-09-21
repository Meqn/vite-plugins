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
  page:
    | string
    | {
        [key: string]: string | PageConfig
      }
  entry?: string
  template?: string
  title?: string
  data?: {
    [key: string]: any
  }
  minify?: boolean
  ejsOptions?: EjsOptions
}

export interface PagesData {
  [key: string]: PageData
}

export type PageEntry = {
  [key: string]: string
}

export interface EjsExtendData {
  BASE_URL?: string
  MODE?: string
  DEV?: boolean
  PROD?: boolean
}

/**
 * Configuration options for clearing browser data
 */
export interface ClearBrowserConfig {
  localStorage?: boolean
  sessionStorage?: boolean
  cookies?: boolean
  indexedDB?: boolean
  cacheStorage?: boolean
}

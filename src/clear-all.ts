/**
 * Convenience function to clear all browser data
 */

import { clearBrowser } from './index'
import type { ClearBrowserResult } from './result-type'

/**
 * Clear all browser data (convenience function)
 */
export async function clearAll(): Promise<ClearBrowserResult> {
  return clearBrowser({
    localStorage: true,
    sessionStorage: true,
    cookies: true,
    indexedDB: true,
    cacheStorage: true,
  })
}

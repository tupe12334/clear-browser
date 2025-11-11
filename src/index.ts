/**
 * clear-browser - Framework-agnostic library to clear browser data
 * Supports: localStorage, sessionStorage, cookies, IndexedDB, and Cache API
 */

import type { ClearBrowserConfig } from './config-type'
import type { ClearBrowserResult } from './result-type'
import { clearLocalStorage } from './clear-local-storage'
import { clearSessionStorage } from './clear-session-storage'
import { clearCookies } from './clear-cookies'
import { clearIndexedDB } from './clear-indexeddb'
import { clearCacheStorage } from './clear-cache-storage'

/**
 * Main function to clear browser data based on configuration
 *
 * @param config - Configuration object specifying what to clear
 * @returns Result object with success status and details
 *
 * @example
 * // Clear all browser data
 * const result = await clearBrowser({
 *   localStorage: true,
 *   sessionStorage: true,
 *   cookies: true,
 *   indexedDB: true,
 *   cacheStorage: true,
 * })
 *
 * @example
 * // Clear only localStorage and cookies
 * const result = await clearBrowser({
 *   localStorage: true,
 *   cookies: true,
 * })
 */
export async function clearBrowser(
  config?: ClearBrowserConfig
): Promise<ClearBrowserResult> {
  const finalConfig = config !== undefined && config !== null ? config : {}
  const cleared: string[] = []
  const errors: Array<{ type: string; error: Error }> = []

  // Clear localStorage
  if (finalConfig.localStorage) {
    const result = clearLocalStorage()
    if (result.success) {
      cleared.push('localStorage')
    } else if (result.error) {
      errors.push({ type: 'localStorage', error: result.error })
    }
  }

  // Clear sessionStorage
  if (finalConfig.sessionStorage) {
    const result = clearSessionStorage()
    if (result.success) {
      cleared.push('sessionStorage')
    } else if (result.error) {
      errors.push({ type: 'sessionStorage', error: result.error })
    }
  }

  // Clear cookies
  if (finalConfig.cookies) {
    const result = clearCookies()
    if (result.success) {
      cleared.push('cookies')
    } else if (result.error) {
      errors.push({ type: 'cookies', error: result.error })
    }
  }

  // Clear IndexedDB
  if (finalConfig.indexedDB) {
    const result = await clearIndexedDB()
    if (result.success) {
      cleared.push('indexedDB')
    } else if (result.error) {
      errors.push({ type: 'indexedDB', error: result.error })
    }
  }

  // Clear Cache Storage
  if (finalConfig.cacheStorage) {
    const result = await clearCacheStorage()
    if (result.success) {
      cleared.push('cacheStorage')
    } else if (result.error) {
      errors.push({ type: 'cacheStorage', error: result.error })
    }
  }

  return {
    success: errors.length === 0,
    cleared,
    errors,
  }
}

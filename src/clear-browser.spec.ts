/* eslint-disable ddd/require-spec-file */
import { describe, it, expect, beforeEach } from 'vitest'
import { clearBrowser } from './index'

describe('clearBrowser', () => {
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear()
    sessionStorage.clear()
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name =
        eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
  })

  describe('localStorage', () => {
    it('should clear localStorage when configured', async () => {
      localStorage.setItem('test', 'value')
      expect(localStorage.length).toBe(1)

      const result = await clearBrowser({ localStorage: true })

      expect(result.success).toBe(true)
      expect(result.cleared).toContain('localStorage')
      expect(localStorage.length).toBe(0)
    })

    it('should not clear localStorage when not configured', async () => {
      localStorage.setItem('test', 'value')

      const result = await clearBrowser({ sessionStorage: true })

      expect(result.success).toBe(true)
      expect(result.cleared).not.toContain('localStorage')
      expect(localStorage.length).toBe(1)
    })
  })

  describe('sessionStorage', () => {
    it('should clear sessionStorage when configured', async () => {
      sessionStorage.setItem('test', 'value')
      expect(sessionStorage.length).toBe(1)

      const result = await clearBrowser({ sessionStorage: true })

      expect(result.success).toBe(true)
      expect(result.cleared).toContain('sessionStorage')
      expect(sessionStorage.length).toBe(0)
    })

    it('should not clear sessionStorage when not configured', async () => {
      sessionStorage.setItem('test', 'value')

      const result = await clearBrowser({ localStorage: true })

      expect(result.success).toBe(true)
      expect(result.cleared).not.toContain('sessionStorage')
      expect(sessionStorage.length).toBe(1)
    })
  })

  describe('cookies', () => {
    it('should clear cookies when configured', async () => {
      document.cookie = 'test=value'

      const result = await clearBrowser({ cookies: true })

      expect(result.success).toBe(true)
      expect(result.cleared).toContain('cookies')
    })

    it('should not clear cookies when not configured', async () => {
      document.cookie = 'test=value'

      const result = await clearBrowser({ localStorage: true })

      expect(result.success).toBe(true)
      expect(result.cleared).not.toContain('cookies')
    })
  })

  describe('indexedDB', () => {
    it('should handle indexedDB clearing when configured', async () => {
      const result = await clearBrowser({ indexedDB: true })

      // In jsdom, indexedDB.databases() may not be supported
      // So we check that either it succeeded or failed with a known error
      if (result.success) {
        expect(result.cleared).toContain('indexedDB')
      } else {
        expect(result.errors.some(e => e.type === 'indexedDB')).toBe(true)
      }
    })

    it('should not clear indexedDB when not configured', async () => {
      const result = await clearBrowser({ localStorage: true })

      expect(result.success).toBe(true)
      expect(result.cleared).not.toContain('indexedDB')
    })
  })

  describe('cacheStorage', () => {
    it('should handle cache storage clearing when configured', async () => {
      const result = await clearBrowser({ cacheStorage: true })

      // In jsdom, caches API may not be fully supported
      // So we check that either it succeeded or failed with a known error
      if (result.success) {
        expect(result.cleared).toContain('cacheStorage')
      } else {
        expect(result.errors.some(e => e.type === 'cacheStorage')).toBe(true)
      }
    })

    it('should not clear cache storage when not configured', async () => {
      const result = await clearBrowser({ localStorage: true })

      expect(result.success).toBe(true)
      expect(result.cleared).not.toContain('cacheStorage')
    })
  })

  describe('multiple storages', () => {
    it('should clear multiple storages when configured', async () => {
      localStorage.setItem('test', 'value')
      sessionStorage.setItem('test', 'value')
      document.cookie = 'test=value'

      const result = await clearBrowser({
        localStorage: true,
        sessionStorage: true,
        cookies: true,
      })

      expect(result.success).toBe(true)
      expect(result.cleared).toContain('localStorage')
      expect(result.cleared).toContain('sessionStorage')
      expect(result.cleared).toContain('cookies')
      expect(localStorage.length).toBe(0)
      expect(sessionStorage.length).toBe(0)
    })
  })

  describe('empty config', () => {
    it('should handle empty config and clear nothing', async () => {
      localStorage.setItem('test', 'value')
      sessionStorage.setItem('test', 'value')

      const result = await clearBrowser({})

      expect(result.success).toBe(true)
      expect(result.cleared).toHaveLength(0)
      expect(localStorage.length).toBe(1)
      expect(sessionStorage.length).toBe(1)
    })

    it('should handle undefined config and clear nothing', async () => {
      localStorage.setItem('test', 'value')
      sessionStorage.setItem('test', 'value')

      const result = await clearBrowser(undefined)

      expect(result.success).toBe(true)
      expect(result.cleared).toHaveLength(0)
      expect(localStorage.length).toBe(1)
      expect(sessionStorage.length).toBe(1)
    })
  })
})

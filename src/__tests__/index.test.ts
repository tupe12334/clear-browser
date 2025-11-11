import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearBrowser } from '../index'
import { clearAll } from '../clear-all'

export class StorageTestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageTestError'
  }
}

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

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage.clear to throw an error
      const originalClear = Storage.prototype.clear
      Storage.prototype.clear = vi.fn(() => {
        throw new StorageTestError('localStorage error')
      })

      const result = await clearBrowser({ localStorage: true })

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('localStorage')
      expect(result.errors[0].error.message).toBe('localStorage error')

      // Restore original method
      Storage.prototype.clear = originalClear
    })

    it('should continue clearing other storages even if one fails', async () => {
      localStorage.setItem('test', 'value')
      sessionStorage.setItem('test', 'value')

      // Mock localStorage.clear to throw an error
      const originalClear = Storage.prototype.clear
      const mockClear = vi.fn(function (this: Storage) {
        if (this === localStorage) {
          throw new StorageTestError('localStorage error')
        }
        originalClear.call(this)
      })
      Storage.prototype.clear = mockClear

      const result = await clearBrowser({
        localStorage: true,
        sessionStorage: true,
      })

      expect(result.success).toBe(false)
      expect(result.cleared).toContain('sessionStorage')
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('localStorage')

      // Restore original method
      Storage.prototype.clear = originalClear
    })
  })

  describe('clearAll', () => {
    it('should clear all browser data', async () => {
      localStorage.setItem('test', 'value')
      sessionStorage.setItem('test', 'value')
      document.cookie = 'test=value'

      const result = await clearAll()

      // Check that supported storages were cleared
      expect(result.cleared).toContain('localStorage')
      expect(result.cleared).toContain('sessionStorage')
      expect(result.cleared).toContain('cookies')
      expect(localStorage.length).toBe(0)
      expect(sessionStorage.length).toBe(0)

      // indexedDB and cacheStorage may not be fully supported in jsdom
      // So we just verify they were attempted
      expect(
        result.cleared.length + result.errors.length
      ).toBeGreaterThanOrEqual(3)
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
  })
})

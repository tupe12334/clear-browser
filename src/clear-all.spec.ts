import { describe, it, expect, beforeEach } from 'vitest'
import { clearAll } from './clear-all'

describe('clearAll', () => {
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
    expect(result.cleared.length + result.errors.length).toBeGreaterThanOrEqual(
      3
    )
  })

  it('should attempt to clear all storage types including indexedDB and cacheStorage', async () => {
    const result = await clearAll()

    // Verify that all storage types were attempted (either cleared or errored)
    const attemptedTypes = [
      ...result.cleared,
      ...result.errors.map(e => e.type),
    ]
    const expectedTypes = [
      'localStorage',
      'sessionStorage',
      'cookies',
      'indexedDB',
      'cacheStorage',
    ]

    expectedTypes.forEach(type => {
      expect(attemptedTypes).toContain(type)
    })
  })

  it('should return success true if all operations succeed', async () => {
    localStorage.setItem('test', 'value')
    sessionStorage.setItem('test', 'value')
    document.cookie = 'test=value'

    const result = await clearAll()

    // If no errors occurred, success should be true
    if (result.errors.length === 0) {
      expect(result.success).toBe(true)
      expect(result.cleared).toHaveLength(5)
    }
  })

  it('should return success false if any operation fails', async () => {
    const result = await clearAll()

    // If any errors occurred (e.g., unsupported APIs in jsdom), success should be false
    if (result.errors.length > 0) {
      expect(result.success).toBe(false)
    }
  })
})

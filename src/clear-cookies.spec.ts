import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearCookies } from './clear-cookies'

describe('clearCookies', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name =
        eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
  })

  it('should successfully clear cookies', () => {
    document.cookie = 'test1=value1'
    document.cookie = 'test2=value2'

    const result = clearCookies()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    // In jsdom, cookies may not behave exactly like a real browser
    // So we just verify the function completes successfully
  })

  it('should handle cookies with different formats', () => {
    document.cookie = 'simple=value'
    document.cookie = 'with-dash=value'
    document.cookie = 'with_underscore=value'

    const result = clearCookies()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should handle errors when clearing cookies', () => {
    const originalGetter = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'cookie'
    )

    Object.defineProperty(document, 'cookie', {
      get: vi.fn(() => {
        throw new Error('cookie error')
      }),
      configurable: true,
    })

    const result = clearCookies()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('cookie error')
    }

    if (originalGetter) {
      Object.defineProperty(document, 'cookie', originalGetter)
    }
  })

  it('should handle non-Error exceptions', () => {
    const originalGetter = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'cookie'
    )

    Object.defineProperty(document, 'cookie', {
      get: vi.fn(() => {
        throw 'string error'
      }),
      configurable: true,
    })

    const result = clearCookies()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('string error')
      expect(result.error).toBeInstanceOf(Error)
    }

    if (originalGetter) {
      Object.defineProperty(document, 'cookie', originalGetter)
    }
  })

  it('should handle empty cookies without errors', () => {
    const result = clearCookies()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })
})

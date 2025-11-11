import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearSessionStorage } from './clear-session-storage'

describe('clearSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('should successfully clear sessionStorage', () => {
    sessionStorage.setItem('key1', 'value1')
    sessionStorage.setItem('key2', 'value2')
    expect(sessionStorage.length).toBe(2)

    const result = clearSessionStorage()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(sessionStorage.length).toBe(0)
  })

  it('should handle errors when clearing sessionStorage', () => {
    const testError = new Error('sessionStorage error')
    const originalClear = Storage.prototype.clear

    Storage.prototype.clear = vi.fn(() => {
      throw testError
    })

    const result = clearSessionStorage()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('sessionStorage error')
    }

    Storage.prototype.clear = originalClear
  })

  it('should handle non-Error exceptions', () => {
    const originalClear = Storage.prototype.clear

    Storage.prototype.clear = vi.fn(() => {
      throw 'string error'
    })

    const result = clearSessionStorage()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('string error')
      expect(result.error).toBeInstanceOf(Error)
    }

    Storage.prototype.clear = originalClear
  })

  it('should clear empty sessionStorage without errors', () => {
    expect(sessionStorage.length).toBe(0)

    const result = clearSessionStorage()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(sessionStorage.length).toBe(0)
  })
})

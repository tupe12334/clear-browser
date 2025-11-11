import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearLocalStorage } from './clear-local-storage'

describe('clearLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should successfully clear localStorage', () => {
    localStorage.setItem('key1', 'value1')
    localStorage.setItem('key2', 'value2')
    expect(localStorage.length).toBe(2)

    const result = clearLocalStorage()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })

  it('should handle errors when clearing localStorage', () => {
    const testError = new Error('localStorage error')
    const originalClear = Storage.prototype.clear

    Storage.prototype.clear = vi.fn(() => {
      throw testError
    })

    const result = clearLocalStorage()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('localStorage error')
    }

    Storage.prototype.clear = originalClear
  })

  it('should handle non-Error exceptions', () => {
    const originalClear = Storage.prototype.clear

    Storage.prototype.clear = vi.fn(() => {
      throw 'string error'
    })

    const result = clearLocalStorage()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('string error')
      expect(result.error).toBeInstanceOf(Error)
    }

    Storage.prototype.clear = originalClear
  })

  it('should clear empty localStorage without errors', () => {
    expect(localStorage.length).toBe(0)

    const result = clearLocalStorage()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })
})

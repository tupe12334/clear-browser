import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearCacheStorage } from './clear-cache-storage'

describe('clearCacheStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully clear cache storage when supported', async () => {
    const mockDelete = vi.fn().mockResolvedValue(true)
    const mockKeys = vi.fn().mockResolvedValue(['cache1', 'cache2'])

    Object.defineProperty(window, 'caches', {
      value: {
        keys: mockKeys,
        delete: mockDelete,
      },
      configurable: true,
      writable: true,
    })

    const result = await clearCacheStorage()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(mockKeys).toHaveBeenCalledTimes(1)
    expect(mockDelete).toHaveBeenCalledTimes(2)
    expect(mockDelete).toHaveBeenCalledWith('cache1')
    expect(mockDelete).toHaveBeenCalledWith('cache2')
  })

  it('should return error when Cache API is not supported', async () => {
    Object.defineProperty(window, 'caches', {
      value: undefined,
      configurable: true,
      writable: true,
    })

    const result = await clearCacheStorage()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('Cache API not supported')
    }
  })

  it('should handle errors when getting cache keys', async () => {
    Object.defineProperty(window, 'caches', {
      value: {
        keys: vi.fn().mockRejectedValue(new Error('keys() failed')),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearCacheStorage()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('keys() failed')
    }
  })

  it('should handle errors when deleting caches', async () => {
    const mockKeys = vi.fn().mockResolvedValue(['cache1'])
    const mockDelete = vi.fn().mockRejectedValue(new Error('delete failed'))

    Object.defineProperty(window, 'caches', {
      value: {
        keys: mockKeys,
        delete: mockDelete,
      },
      configurable: true,
      writable: true,
    })

    const result = await clearCacheStorage()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('delete failed')
    }
  })

  it('should handle non-Error exceptions', async () => {
    Object.defineProperty(window, 'caches', {
      value: {
        keys: vi.fn().mockRejectedValue('string error'),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearCacheStorage()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('string error')
      expect(result.error).toBeInstanceOf(Error)
    }
  })

  it('should handle empty cache list without errors', async () => {
    Object.defineProperty(window, 'caches', {
      value: {
        keys: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearCacheStorage()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should delete multiple caches in parallel', async () => {
    const mockDelete = vi.fn().mockResolvedValue(true)
    const mockKeys = vi
      .fn()
      .mockResolvedValue(['cache1', 'cache2', 'cache3', 'cache4'])

    Object.defineProperty(window, 'caches', {
      value: {
        keys: mockKeys,
        delete: mockDelete,
      },
      configurable: true,
      writable: true,
    })

    const result = await clearCacheStorage()

    expect(result.success).toBe(true)
    expect(mockDelete).toHaveBeenCalledTimes(4)
  })
})

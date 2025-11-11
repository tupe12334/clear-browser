import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearIndexedDB } from './clear-indexeddb'

describe('clearIndexedDB', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully clear indexedDB when supported', async () => {
    // Mock indexedDB.databases()
    const mockDatabases = vi.fn().mockResolvedValue([
      { name: 'db1', version: 1 },
      { name: 'db2', version: 1 },
    ])

    Object.defineProperty(window, 'indexedDB', {
      value: {
        databases: mockDatabases,
        deleteDatabase: vi.fn((name: string) => {
          const request: Record<string, unknown> = {}
          Object.defineProperty(request, 'onsuccess', {
            set(handler: () => void) {
              setTimeout(handler, 0)
            },
            configurable: true,
          })
          return request
        }),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearIndexedDB()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should return error when indexedDB is not supported', async () => {
    Object.defineProperty(window, 'indexedDB', {
      value: undefined,
      configurable: true,
      writable: true,
    })

    const result = await clearIndexedDB()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('IndexedDB not supported')
    }
  })

  it('should handle errors when deleting databases', async () => {
    const testError = new Error('Database deletion failed')
    const mockDatabases = vi.fn().mockResolvedValue([{ name: 'db1' }])

    Object.defineProperty(window, 'indexedDB', {
      value: {
        databases: mockDatabases,
        deleteDatabase: vi.fn(() => {
          const request: Record<string, unknown> = {}
          Object.defineProperty(request, 'onerror', {
            set(handler: (event: { target: { error: Error } }) => void) {
              setTimeout(() => handler({ target: { error: testError } }), 0)
            },
            configurable: true,
          })
          return request
        }),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearIndexedDB()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should handle databases() throwing an error', async () => {
    Object.defineProperty(window, 'indexedDB', {
      value: {
        databases: vi.fn().mockRejectedValue(new Error('databases() failed')),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearIndexedDB()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('databases() failed')
    }
  })

  it('should handle non-Error exceptions', async () => {
    Object.defineProperty(window, 'indexedDB', {
      value: {
        databases: vi.fn().mockRejectedValue('string error'),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearIndexedDB()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toBe('string error')
      expect(result.error).toBeInstanceOf(Error)
    }
  })

  it('should handle blocked database deletion', async () => {
    const mockDatabases = vi.fn().mockResolvedValue([{ name: 'db1' }])

    Object.defineProperty(window, 'indexedDB', {
      value: {
        databases: mockDatabases,
        deleteDatabase: vi.fn(() => {
          const request: Record<string, unknown> = {}
          Object.defineProperty(request, 'onblocked', {
            set(handler: () => void) {
              setTimeout(handler, 0)
            },
            configurable: true,
          })
          return request
        }),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearIndexedDB()

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.message).toContain('blocked')
    }
  })

  it('should skip databases without names', async () => {
    const mockDatabases = vi
      .fn()
      .mockResolvedValue([{ name: undefined }, { name: 'db1', version: 1 }])

    Object.defineProperty(window, 'indexedDB', {
      value: {
        databases: mockDatabases,
        deleteDatabase: vi.fn((name: string) => {
          const request: Record<string, unknown> = {}
          Object.defineProperty(request, 'onsuccess', {
            set(handler: () => void) {
              setTimeout(handler, 0)
            },
            configurable: true,
          })
          return request
        }),
      },
      configurable: true,
      writable: true,
    })

    const result = await clearIndexedDB()

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })
})

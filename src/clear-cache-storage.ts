/**
 * Clear Cache Storage
 */
export async function clearCacheStorage(): Promise<{
  success: boolean
  error?: Error
}> {
  try {
    if (!window.caches) {
      return { success: false, error: new Error('Cache API not supported') }
    }

    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Clear IndexedDB databases
 */
export async function clearIndexedDB(): Promise<{
  success: boolean
  error?: Error
}> {
  try {
    if (!window.indexedDB) {
      return { success: false, error: new Error('IndexedDB not supported') }
    }

    const databases = await window.indexedDB.databases()
    await Promise.all(
      databases.map(db => {
        if (db.name) {
          return new Promise<void>((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(db.name!)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
            request.onblocked = () =>
              reject(new Error('Database deletion blocked'))
          })
        }
        return Promise.resolve()
      })
    )
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

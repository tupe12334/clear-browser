/**
 * Clear sessionStorage data
 */
export function clearSessionStorage(): { success: boolean; error?: Error } {
  try {
    sessionStorage.clear()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

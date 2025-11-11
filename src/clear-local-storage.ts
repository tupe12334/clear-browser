/**
 * Clear localStorage data
 */
export function clearLocalStorage(): { success: boolean; error?: Error } {
  try {
    localStorage.clear()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Result of clearing browser data
 */
export interface ClearBrowserResult {
  success: boolean
  cleared: string[]
  errors: Array<{ type: string; error: Error }>
}

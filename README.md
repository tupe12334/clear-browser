# clear-browser

Framework-agnostic library to clear browser data (localStorage, cookies, IndexedDB, cache, etc.) with configurable options.

## Installation

```bash
npm install clear-browser
# or
pnpm add clear-browser
# or
yarn add clear-browser
```

## Features

- Clear localStorage
- Clear sessionStorage
- Clear cookies
- Clear IndexedDB
- Clear Cache Storage (Cache API)
- Framework-agnostic (works with React, Vue, Angular, vanilla JS, etc.)
- TypeScript support
- Configurable - choose what to clear
- Error handling with detailed results

## Usage

### Clear All Browser Data

```typescript
import { clearAll } from 'clear-browser'

// Clear everything
const result = await clearAll()
console.log(result)
// {
//   success: true,
//   cleared: ['localStorage', 'sessionStorage', 'cookies', 'indexedDB', 'cacheStorage'],
//   errors: []
// }
```

### Clear Specific Data

```typescript
import { clearBrowser } from 'clear-browser'

// Clear only localStorage and cookies
const result = await clearBrowser({
  localStorage: true,
  cookies: true,
})

console.log(result)
// {
//   success: true,
//   cleared: ['localStorage', 'cookies'],
//   errors: []
// }
```

### Configuration Options

```typescript
interface ClearBrowserConfig {
  localStorage?: boolean // Clear localStorage
  sessionStorage?: boolean // Clear sessionStorage
  cookies?: boolean // Clear cookies
  indexedDB?: boolean // Clear IndexedDB
  cacheStorage?: boolean // Clear Cache Storage
}
```

### Result Object

```typescript
interface ClearBrowserResult {
  success: boolean // Overall success status
  cleared: string[] // Array of cleared storage types
  errors: Array<{ type: string; error: Error }> // Any errors encountered
}
```

## Examples

### React Example

```typescript
import { clearBrowser } from 'clear-browser'

function LogoutButton() {
  const handleLogout = async () => {
    const result = await clearBrowser({
      localStorage: true,
      sessionStorage: true,
      cookies: true,
    })

    if (result.success) {
      console.log('Browser data cleared successfully')
      // Redirect to login page
    } else {
      console.error('Some data failed to clear:', result.errors)
    }
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

### Vue Example

```vue
<script setup>
import { clearBrowser } from 'clear-browser'

const logout = async () => {
  const result = await clearBrowser({
    localStorage: true,
    sessionStorage: true,
    cookies: true,
  })

  if (result.success) {
    console.log('Cleared:', result.cleared)
  }
}
</script>

<template>
  <button @click="logout">Logout</button>
</template>
```

### Vanilla JavaScript Example

```html
<script type="module">
  import { clearAll } from 'clear-browser'

  document.getElementById('clearBtn').addEventListener('click', async () => {
    const result = await clearAll()
    console.log('Result:', result)
  })
</script>

<button id="clearBtn">Clear All Data</button>
```

## Browser Support

- Modern browsers with support for:
  - localStorage / sessionStorage
  - Cookies
  - IndexedDB
  - Cache API

## Error Handling

The library handles errors gracefully and continues clearing other storage types even if one fails:

```typescript
const result = await clearBrowser({
  localStorage: true,
  sessionStorage: true,
  indexedDB: true,
})

if (!result.success) {
  console.log('Successfully cleared:', result.cleared)
  console.log('Failed to clear:', result.errors)

  result.errors.forEach(err => {
    console.error(`Failed to clear ${err.type}:`, err.error.message)
  })
}
```

## License

MIT

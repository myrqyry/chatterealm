import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createMaterialTheme } from './utils/materialTheme'
import App from './App.tsx'
import './index.css'

const theme = createMaterialTheme()

// Development-only: capture unhandled promise rejections with extra context
// determine dev mode safely (works in Vite and non-Vite environments)
const _isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production'
  ? process.env.NODE_ENV !== 'production'
  : typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

if (_isDev) {
  window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
    try {
      // Print a compact, consistent grouping so we can copy/paste the stack
      // and quickly identify origin (extension vs app code).
      // Avoid throwing from the handler.
      // eslint-disable-next-line no-console
      console.groupCollapsed('[DEV] Unhandled rejection captured')
      // eslint-disable-next-line no-console
      console.log('reason:', ev.reason)
      // eslint-disable-next-line no-console
      console.log('stack:', ev.reason && ev.reason.stack)
      // eslint-disable-next-line no-console
      console.log('promise:', ev.promise)
      // eslint-disable-next-line no-console
      console.log('event:', ev)
      // eslint-disable-next-line no-console
      console.groupEnd()
    } catch (e) {
      // swallow any error from logging
    }
  })
}

import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
)

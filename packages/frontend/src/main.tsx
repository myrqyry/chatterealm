import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './index.css'

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)

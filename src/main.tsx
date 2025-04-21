
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { initDatabase } from './utils/sync' // Use the correct function name from sync.ts
import './index.css'
import { register as registerServiceWorker } from './serviceWorkerRegistration'

// Initialize IndexedDB
initDatabase().catch(err => {
  console.error('Failed to initialize IndexedDB:', err)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker for PWA support
registerServiceWorker({
  onSuccess: (registration) => {
    console.log('PWA registration successful', registration)
  },
  onUpdate: (registration) => {
    console.log('New content is available; please refresh.', registration)
  },
})

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary'
import { ErrorProvider } from './contexts'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary fallbackMessage="Something went wrong with the Real-time Map application. Please try reloading the page.">
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </ErrorBoundary>
  </StrictMode>,
)

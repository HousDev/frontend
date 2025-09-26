import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'
import { SystemSettingsProvider } from "@/contexts/SystemSettingsContext";
import 'react-phone-input-2/lib/style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SystemSettingsProvider>
        <App />
      </SystemSettingsProvider>
    </ErrorBoundary>
  </StrictMode>,
)

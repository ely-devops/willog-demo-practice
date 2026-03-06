import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './locales/i18n'
import App from './App.tsx'

// Initialize document lang from stored preference before React hydration
// This ensures GT-America font is applied immediately for English users
const storedLang = localStorage.getItem('willog-language');
if (storedLang) {
  try {
    const parsed = JSON.parse(storedLang);
    if (parsed?.state?.language) {
      document.documentElement.lang = parsed.state.language;
    }
  } catch {
    // Fallback to default 'ko' if parsing fails
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

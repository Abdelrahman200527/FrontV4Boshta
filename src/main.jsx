import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import { initAntiInspect } from './utils/antiInspect'

// initAntiInspect()

// Auto-recover when a newly deployed build has replaced old dynamic import chunks
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    const storageKey = "vite_preload_error_reload";
    const lastReload = Number(sessionStorage.getItem(storageKey) || 0);
    const now = Date.now();
    if (now - lastReload > 8000) {
      sessionStorage.setItem(storageKey, String(now));
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

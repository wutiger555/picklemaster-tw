import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 部署後舊分頁去載已被換掉的 chunk 會失敗、整頁空白：自動重新載入一次拿新版。
// 10 秒內只重載一次，避免檔案真的壞掉時無限迴圈。
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem('preload-reload-at') || 0)
    if (Date.now() - last < 10_000) return
    sessionStorage.setItem('preload-reload-at', String(Date.now()))
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

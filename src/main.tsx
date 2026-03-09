import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'

// Capacitor WebView에서도 별도 확인창 없이 최신 SW를 바로 적용한다.
registerSW({
  immediate: true,
  onNeedRefresh() {
    // 새 버전을 감지하면 즉시 새로고침한다.
    window.location.reload()
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

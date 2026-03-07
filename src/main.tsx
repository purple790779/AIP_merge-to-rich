import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

import { registerSW } from 'virtual:pwa-register'

// 서비스 워커 자동 업데이트 (Capacitor WebView에서 confirm() 미지원)
registerSW({
  immediate: true,
  onNeedRefresh() {
    // 자동으로 새 버전 적용
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


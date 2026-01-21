import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BlogPage from './pages/BlogPage'

// 根據 URL 決定渲染哪個組件
// 注意：www 重導向已移至 index.html 的 inline script（必須在 React 載入前執行，避免無限循環）
// 優先使用 index.html 設定的 flag（繞過 bundle 快取問題）
const isBlogRoute = (window as any).__BLOG_ROUTE__ === true || window.location.pathname.startsWith('/blog');
console.log('[MAIN.TSX v3] pathname:', window.location.pathname, '| isBlogRoute:', isBlogRoute, '| flag:', (window as any).__BLOG_ROUTE__);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isBlogRoute ? (
      <BlogPage
        onBack={() => {
          window.history.pushState({}, '', '/');
          window.location.reload();
        }}
        onLogin={() => {
          window.history.pushState({}, '', '/register');
          window.location.reload();
        }}
      />
    ) : (
      <App />
    )}
  </StrictMode>,
)

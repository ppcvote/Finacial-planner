import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BlogPage from './pages/BlogPage'

// 🔄 Vercel 網域重導向到正式網域
// 解決 .vercel.app 網域上 reCAPTCHA 無法運作的問題
if (window.location.hostname.includes('.vercel.app')) {
  const newUrl = `https://ultra-advisor.tw${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(newUrl);
}

// 根據 URL 決定渲染哪個組件（在 React 初始化之前）
// 注意：www 重導向已移至 index.html 的 inline script（避免重複執行）
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

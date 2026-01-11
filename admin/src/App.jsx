import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import SiteEditor from './pages/SiteEditor.jsx';
import MainLayout from './components/Layout';

// ✅ Debug 組件：顯示當前路由
const DebugRoute = () => {
  const location = useLocation();
  console.log('📍 當前路由:', location.pathname);
  return null;
};

// ✅ 受保護的路由
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = 載入中, null = 未登入
  const location = useLocation();

  useEffect(() => {
    console.log('🔄 ProtectedRoute useEffect 啟動');
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔥 onAuthStateChanged 觸發:', currentUser ? `已登入 (${currentUser.email})` : '未登入');
      console.log('🔥 User UID:', currentUser?.uid);
      setUser(currentUser);
    });

    return () => {
      console.log('🧹 ProtectedRoute cleanup');
      unsubscribe();
    };
  }, []);

  console.log('🎯 ProtectedRoute render, user:', user === undefined ? 'loading' : (user ? user.email : 'null'));
  console.log('🎯 當前路徑:', location.pathname);

  // 載入中
  if (user === undefined) {
    console.log('⏳ 顯示載入畫面');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-slate-400">載入中...</div>
          <div className="text-sm text-slate-500 mt-2">檢查登入狀態</div>
        </div>
      </div>
    );
  }

  // 未登入
  if (user === null) {
    console.log('🚫 未登入，重定向到登入頁');
    return <Navigate to="/secret-admin-ultra-2026" replace />;
  }

  // 已登入
  console.log('✅ 已登入，顯示內容');
  return children;
};

function App() {
  console.log('🚀 App 組件渲染');

  return (
    <ConfigProvider locale={zhTW}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <DebugRoute />
        <Routes>
          {/* 首頁 */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            } 
          />

          {/* 登入頁 */}
          <Route path="/secret-admin-ultra-2026" element={<Login />} />

          {/* 後台路由 */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="site-editor" element={<SiteEditor />} />
          </Route>

          {/* 舊路徑重定向 */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/login" element={<Navigate to="/secret-admin-ultra-2026" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/secret-admin-ultra-2026" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

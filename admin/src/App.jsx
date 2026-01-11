import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import DataMigration from './pages/DataMigration';
import MainLayout from './components/Layout';

// 受保護的路由（需要管理員權限）
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 檢查是否為管理員
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        setIsAdmin(adminDoc.exists());
        setUser(user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/secret-admin-ultra-2026" replace />;
  }

  return children;
};

function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* 公開首頁 */}
          <Route path="/" element={<LandingPage />} />

          {/* 秘密後台登入入口（只有管理員知道）*/}
          <Route path="/secret-admin-ultra-2026" element={<Login />} />

          {/* 受保護的後台管理路由 */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* 預設重定向到儀表板 */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* 儀表板 */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* 用戶管理 */}
            <Route path="users" element={<Users />} />

            {/* 資料遷移工具 */}
            <Route path="data-migration" element={<DataMigration />} />

            {/* 內容管理 */}
            <Route path="content" element={<div>內容管理（即將推出）</div>} />

            {/* LINE Bot 設定 */}
            <Route path="linebot" element={<div>LINE Bot 設定（即將推出）</div>} />

            {/* 統計分析 */}
            <Route path="stats" element={<div>統計分析（即將推出）</div>} />

            {/* 系統設定 */}
            <Route path="settings" element={<div>系統設定（即將推出）</div>} />
          </Route>

          {/* 舊路徑重定向（向後兼容）*/}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/login" element={<Navigate to="/secret-admin-ultra-2026" replace />} />

          {/* 404 - 重定向到首頁 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

// ==========================================
// 📁 admin/src/App.jsx
// ✅ 已加入官網內容編輯器路由
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// 頁面組件
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import SiteEditor from './pages/SiteEditor';  // ✅ 新增：官網內容編輯器

// 載入畫面
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent 
                     rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">載入中...</p>
    </div>
  </div>
);

// 受保護路由
const ProtectedRoute = ({ children, user, isAdmin, loading }) => {
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">權限不足</h2>
          <p className="text-gray-600 mb-6">您沒有管理員權限，無法存取此頁面。</p>
          <button
            onClick={() => auth.signOut()}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg 
                     font-medium transition-colors"
          >
            返回登入
          </button>
        </div>
      </div>
    );
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 檢查是否為管理員
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin' || userData.isAdmin === true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('檢查管理員權限失敗:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        {/* 登入頁 */}
        <Route 
          path="/login" 
          element={
            user && isAdmin ? <Navigate to="/" replace /> : <Login />
          } 
        />
        
        {/* 受保護的後台頁面 */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={user} isAdmin={isAdmin} loading={loading}>
              <Layout user={user} />
            </ProtectedRoute>
          }
        >
          {/* 總覽 */}
          <Route index element={<Dashboard />} />
          
          {/* 用戶管理 */}
          <Route path="users" element={<Users />} />
          
          {/* ✅ 新增：官網內容編輯器 */}
          <Route path="site-editor" element={<SiteEditor />} />
        </Route>
        
        {/* 404 導向首頁 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

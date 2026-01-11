// ==========================================
// 📁 admin/src/components/Layout.jsx
// ✅ 已加入「官網內容」選單項目
// ==========================================

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  LayoutDashboard, 
  Users, 
  Globe,      // ✅ 新增：官網圖示
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Shield,
  Zap
} from 'lucide-react';

export default function Layout({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  // 選單項目
  const menuItems = [
    {
      path: '/',
      icon: LayoutDashboard,
      label: '總覽',
      end: true
    },
    {
      path: '/users',
      icon: Users,
      label: '用戶管理'
    },
    {
      path: '/site-editor',  // ✅ 新增
      icon: Globe,
      label: '官網內容'
    }
  ];

  // 選單項目樣式
  const navLinkClass = ({ isActive }) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
    ${isActive 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* ==================== 側邊欄（桌面版）==================== */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col fixed h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 
                           rounded-xl flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg">Ultra Admin</h1>
              <p className="text-xs text-slate-500">管理後台</p>
            </div>
          </div>
        </div>

        {/* 選單 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={navLinkClass}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 用戶資訊 & 登出 */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center 
                           justify-center font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Shield size={10} /> 管理員
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                     bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 
                     hover:text-white transition-all font-medium"
          >
            <LogOut size={18} />
            登出
          </button>
        </div>
      </aside>

      {/* ==================== 手機版側邊欄 ==================== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* 側邊欄 */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-900 text-white 
                           flex flex-col shadow-2xl animate-slide-in">
            {/* 關閉按鈕 */}
            <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="text-blue-400" size={24} />
                <span className="font-bold">Ultra Admin</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* 選單 */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={navLinkClass}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight size={16} className="ml-auto opacity-50" />
                </NavLink>
              ))}
            </nav>

            {/* 登出 */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                         bg-red-600/10 hover:bg-red-600/20 border border-red-500/30
                         rounded-xl text-red-400 font-medium transition-all"
              >
                <LogOut size={18} />
                登出
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ==================== 主內容區 ==================== */}
      <main className="flex-1 md:ml-64">
        {/* 手機版 Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 
                          flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <Zap className="text-blue-600" size={20} />
            <span className="font-bold text-gray-800">Ultra Admin</span>
          </div>
          
          <div className="w-10" /> {/* 佔位 */}
        </header>

        {/* 頁面內容 */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* 動畫樣式 */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

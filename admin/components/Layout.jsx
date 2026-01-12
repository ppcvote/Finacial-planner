import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  GlobalOutlined,
  CrownOutlined,
  GiftOutlined,
  StarOutlined,
  HistoryOutlined,
  AuditOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 選單項目
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '總覽',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: '用戶管理',
    },
    {
      type: 'divider',
    },
    {
      key: 'membership-system',
      icon: <CrownOutlined />,
      label: '會員系統',
      children: [
        {
          key: '/admin/membership/tiers',
          icon: <StarOutlined />,
          label: '身分組管理',
        },
        {
          key: '/admin/membership/points-rules',
          icon: <GiftOutlined />,
          label: '點數規則',
        },
        {
          key: '/admin/membership/redeemable-items',
          icon: <GiftOutlined />,
          label: '兌換商品',
        },
        {
          key: '/admin/membership/points-ledger',
          icon: <HistoryOutlined />,
          label: '點數紀錄',
        },
        {
          key: '/admin/membership/audit-logs',
          icon: <AuditOutlined />,
          label: '操作日誌',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: '/admin/content',
      icon: <GlobalOutlined />,
      label: '官網內容',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '系統設定',
    },
  ];

  // 用戶選單
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      danger: true,
    },
  ];

  // 處理選單點擊
  const handleMenuClick = ({ key }) => {
    if (key && !key.startsWith('membership-system')) {
      navigate(key);
    }
  };

  // 處理登出
  const handleUserMenuClick = async ({ key }) => {
    if (key === 'logout') {
      try {
        await signOut(auth);
        message.success('已登出');
        navigate('/secret-admin-ultra-2026');
      } catch (error) {
        console.error('Logout error:', error);
        message.error('登出失敗');
      }
    }
  };

  // 取得當前選中的選單項目
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    return [pathname];
  };

  // 取得當前展開的子選單
  const getOpenKeys = () => {
    const pathname = location.pathname;
    if (pathname.includes('/admin/membership')) {
      return ['membership-system'];
    }
    return [];
  };

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo 區域 */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            {!collapsed && (
              <div>
                <div className="text-white font-bold text-sm">Ultra Admin</div>
                <div className="text-slate-400 text-xs">管理後台</div>
              </div>
            )}
          </div>
        </div>

        {/* 選單 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />

        {/* 底部用戶資訊 */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700"
          style={{ background: '#001529' }}
        >
          <div className="flex items-center gap-3">
            <Avatar 
              icon={<UserOutlined />} 
              className="bg-blue-500"
              size={collapsed ? 'small' : 'default'}
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  Admin
                </div>
                <div className="text-slate-400 text-xs">
                  ○ 管理員
                </div>
              </div>
            )}
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header 
          className="bg-white shadow-sm px-4 flex items-center justify-between"
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 100,
            padding: '0 24px',
          }}
        >
          <div className="flex items-center gap-4">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'text-xl cursor-pointer hover:text-blue-500 transition-colors',
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{auth.currentUser?.email}</span>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Avatar
                icon={<UserOutlined />}
                className="cursor-pointer bg-blue-500"
              />
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="m-6 min-h-[calc(100vh-88px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

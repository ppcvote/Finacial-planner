import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  RobotOutlined,
  BarChartOutlined,
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
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '儀表板',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用戶管理',
    },
    {
      key: '/content',
      icon: <FileTextOutlined />,
      label: '內容管理',
    },
    {
      key: '/linebot',
      icon: <RobotOutlined />,
      label: 'LINE Bot',
    },
    {
      key: '/stats',
      icon: <BarChartOutlined />,
      label: '統計分析',
    },
    {
      key: '/settings',
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
    navigate(key);
  };

  // 處理登出
  const handleUserMenuClick = async ({ key }) => {
    if (key === 'logout') {
      try {
        await signOut(auth);
        message.success('已登出');
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        message.error('登出失敗');
      }
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="h-16 flex items-center justify-center text-white text-xl font-bold">
          {collapsed ? 'UA' : 'Ultra Advisor'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'text-xl cursor-pointer hover:text-blue-500 transition-colors',
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">{auth.currentUser?.email}</span>
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

        <Content className="m-6 p-6 bg-gray-50 min-h-[calc(100vh-88px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

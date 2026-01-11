import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Statistic, Tag } from 'antd';
import {
  UserAddOutlined,
  UserOutlined,
  RiseOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [stats, setStats] = useState({
    newToday: 0,
    trialUsers: 0,
    activeUsers: 0,
    conversionRate: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 獲取統計數據
  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      // 今日新增用戶
      const newUsersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', todayTimestamp)
      );
      const newUsersSnapshot = await getDocs(newUsersQuery);

      // 試用中用戶
      const trialUsersQuery = query(
        collection(db, 'users'),
        where('subscriptionStatus', '==', 'trial'),
        where('isActive', '==', true)
      );
      const trialUsersSnapshot = await getDocs(trialUsersQuery);

      // 活躍用戶（最近 7 天有登入）
      const sevenDaysAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const activeUsersQuery = query(
        collection(db, 'users'),
        where('lastLoginAt', '>=', sevenDaysAgo)
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);

      // 計算轉換率（簡化版）
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      const paidUsersQuery = query(
        collection(db, 'users'),
        where('subscriptionStatus', '==', 'paid')
      );
      const paidUsersSnapshot = await getDocs(paidUsersQuery);
      const conversionRate = allUsersSnapshot.size > 0
        ? (paidUsersSnapshot.size / allUsersSnapshot.size * 100).toFixed(1)
        : 0;

      setStats({
        newToday: newUsersSnapshot.size,
        trialUsers: trialUsersSnapshot.size,
        activeUsers: activeUsersSnapshot.size,
        conversionRate: parseFloat(conversionRate),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(usersQuery);
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({
          key: doc.id,
          id: doc.id,
          ...doc.data(),
        });
      });

      setRecentUsers(users);
    } catch (error) {
      console.error('Error fetching recent users:', error);
    }
  };

  // 表格列定義
  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '狀態',
      dataIndex: 'subscriptionStatus',
      key: 'status',
      render: (status) => {
        const colorMap = {
          trial: 'blue',
          paid: 'green',
          expired: 'red',
        };
        const textMap = {
          trial: '試用中',
          paid: '已付費',
          expired: '已過期',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: '註冊時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (timestamp) => {
        if (!timestamp) return '-';
        return dayjs(timestamp.toDate()).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      title: '到期時間',
      dataIndex: 'trialExpiresAt',
      key: 'expiresAt',
      render: (timestamp) => {
        if (!timestamp) return '-';
        const daysLeft = Math.ceil((timestamp.toMillis() - Date.now()) / (1000 * 60 * 60 * 24));
        return `${daysLeft} 天後`;
      },
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">儀表板</h1>

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={stats.newToday}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="試用用戶"
              value={stats.trialUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活躍用戶"
              value={stats.activeUsers}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="轉換率"
              value={stats.conversionRate}
              prefix={<PercentageOutlined />}
              suffix="%"
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 最新用戶 */}
      <Card title="最新用戶" className="shadow-sm">
        <Table
          columns={columns}
          dataSource={recentUsers}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;

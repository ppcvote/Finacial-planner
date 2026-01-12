import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Spin } from 'antd';
import {
  CrownOutlined,
  UserOutlined,
  GiftOutlined,
  StarOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';

const MembershipOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    founderMembers: 0,
    paidMembers: 0,
    trialMembers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    pendingOrders: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [tierDistribution, setTierDistribution] = useState([]);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // 獲取用戶統計
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));

      // 獲取身分組資料
      const tiersSnapshot = await getDocs(collection(db, 'membershipTiers'));
      const tiers = {};
      tiersSnapshot.forEach(doc => {
        tiers[doc.id] = { id: doc.id, ...doc.data() };
      });

      // 計算各身分組人數
      const tierCounts = {};
      users.forEach(user => {
        const primaryTier = user.primaryTierId || user.subscriptionStatus || 'trial';
        tierCounts[primaryTier] = (tierCounts[primaryTier] || 0) + 1;
      });

      // 轉換為圖表資料
      const distribution = Object.entries(tierCounts).map(([tierId, count]) => ({
        tier: tiers[tierId]?.name || tierId,
        count,
        color: tiers[tierId]?.color || '#64748b',
        percentage: ((count / users.length) * 100).toFixed(1),
      }));

      setTierDistribution(distribution);

      // 計算統計數據
      const founderCount = tierCounts['founder'] || 0;
      const paidCount = tierCounts['paid'] || 0;
      const trialCount = tierCounts['trial'] || 0;

      // 計算總點數（簡化版，實際應從 pointsLedger 統計）
      let totalEarned = 0;
      let totalSpent = 0;
      users.forEach(user => {
        totalEarned += user.totalPointsEarned || 0;
        totalSpent += user.totalPointsSpent || 0;
      });

      // 獲取待處理訂單數
      const pendingOrdersQuery = query(
        collection(db, 'redemptionOrders'),
        where('status', '==', 'pending')
      );
      const pendingOrdersSnapshot = await getDocs(pendingOrdersQuery);

      setStats({
        totalMembers: users.length,
        founderMembers: founderCount,
        paidMembers: paidCount,
        trialMembers: trialCount,
        totalPointsIssued: totalEarned,
        totalPointsRedeemed: totalSpent,
        pendingOrders: pendingOrdersSnapshot.size,
      });

      // 獲取最近活動（操作日誌）
      try {
        const logsQuery = query(
          collection(db, 'operationLogs'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const logsSnapshot = await getDocs(logsQuery);
        const logs = [];
        logsSnapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));
        setRecentActivities(logs);
      } catch (e) {
        // 如果還沒有操作日誌，忽略錯誤
        console.log('No operation logs yet');
      }

    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 活動表格列
  const activityColumns = [
    {
      title: '時間',
      dataIndex: 'createdAt',
      key: 'time',
      width: 150,
      render: (timestamp) => {
        if (!timestamp) return '-';
        return dayjs(timestamp.toDate()).format('MM-DD HH:mm');
      },
    },
    {
      title: '操作者',
      dataIndex: 'operatorEmail',
      key: 'operator',
      width: 180,
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🏆 會員系統概覽</h1>

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總會員數"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="創始會員"
              value={stats.founderMembers}
              suffix="/ 100"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
            <Progress 
              percent={stats.founderMembers} 
              showInfo={false} 
              strokeColor="#f59e0b"
              size="small"
              className="mt-2"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="付費會員"
              value={stats.paidMembers}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="試用會員"
              value={stats.trialMembers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#64748b' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="已發放點數"
              value={stats.totalPointsIssued}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#a855f7' }}
              suffix="點"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="已兌換點數"
              value={stats.totalPointsRedeemed}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#ec4899' }}
              suffix="點"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="待處理訂單"
              value={stats.pendingOrders}
              prefix={<RiseOutlined />}
              valueStyle={{ color: stats.pendingOrders > 0 ? '#ef4444' : '#22c55e' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 身分組分布 + 最近活動 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="📊 身分組分布">
            {tierDistribution.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{item.tier}</span>
                  <span className="text-gray-500">{item.count} 人 ({item.percentage}%)</span>
                </div>
                <Progress 
                  percent={parseFloat(item.percentage)} 
                  showInfo={false}
                  strokeColor={item.color}
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📜 最近操作日誌">
            {recentActivities.length > 0 ? (
              <Table
                columns={activityColumns}
                dataSource={recentActivities}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <div className="text-center text-gray-400 py-8">
                暫無操作日誌
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 快速入口 */}
      <Card title="⚡ 快速入口" className="mt-6">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={4}>
            <a href="/admin/membership/tiers" className="block text-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <TrophyOutlined className="text-2xl text-amber-500 mb-2" />
              <div className="text-sm">身分組管理</div>
            </a>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <a href="/admin/membership/points-rules" className="block text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <StarOutlined className="text-2xl text-purple-500 mb-2" />
              <div className="text-sm">點數規則</div>
            </a>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <a href="/admin/membership/redeemable-items" className="block text-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
              <GiftOutlined className="text-2xl text-pink-500 mb-2" />
              <div className="text-sm">兌換商品</div>
            </a>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <a href="/admin/membership/points-ledger" className="block text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <RiseOutlined className="text-2xl text-blue-500 mb-2" />
              <div className="text-sm">點數帳本</div>
            </a>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <a href="/admin/membership/operation-logs" className="block text-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <UserOutlined className="text-2xl text-slate-500 mb-2" />
              <div className="text-sm">操作日誌</div>
            </a>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <a href="/admin/users" className="block text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <UserOutlined className="text-2xl text-green-500 mb-2" />
              <div className="text-sm">用戶管理</div>
            </a>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MembershipOverview;

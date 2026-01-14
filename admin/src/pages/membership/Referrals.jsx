/**
 * Ultra Advisor Admin - 推薦紀錄頁面
 * 顯示用戶推薦關係與獎勵發放紀錄
 *
 * 檔案位置：admin/src/pages/membership/Referrals.jsx
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Input,
  Typography,
  Avatar,
  Tooltip,
  message,
} from 'antd';
import {
  ReloadOutlined,
  UsergroupAddOutlined,
  GiftOutlined,
  UserOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';

const { Text } = Typography;

const Referrals = () => {
  const [users, setUsers] = useState([]);
  const [referralCodes, setReferralCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({
    totalReferrers: 0,
    totalReferred: 0,
    totalRewardsGiven: 0,
    pendingRewards: 0,
  });

  // 載入資料
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 取得所有用戶
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      usersSnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);

      // 取得推薦碼
      const codesSnapshot = await getDocs(collection(db, 'referralCodes'));
      const codeList = [];
      codesSnapshot.forEach((doc) => {
        codeList.push({ id: doc.id, ...doc.data() });
      });
      setReferralCodes(codeList);

      // 計算統計
      const referrers = userList.filter((u) => u.referralCount > 0);
      const referred = userList.filter((u) => u.referredBy);
      const rewardsGiven = userList.filter((u) => u.referralRewardClaimed);
      const pendingRewards = userList.filter(
        (u) => u.referredBy && !u.referralRewardClaimed && u.primaryTierId !== 'paid'
      );

      setStats({
        totalReferrers: referrers.length,
        totalReferred: referred.length,
        totalRewardsGiven: rewardsGiven.length,
        pendingRewards: pendingRewards.length,
      });
    } catch (error) {
      console.error('Fetch referrals error:', error);
      message.error('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 取得推薦人資訊
  const getReferrer = (referredBy) => {
    return users.find((u) => u.id === referredBy);
  };

  // 取得被推薦人列表
  const getReferredUsers = (userId) => {
    return users.filter((u) => u.referredBy === userId);
  };

  // 複製推薦碼
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success('已複製推薦碼');
  };

  // 過濾用戶（有推薦關係的）
  const referralUsers = users.filter(
    (u) => u.referralCount > 0 || u.referredBy
  );

  // 搜尋過濾
  const filteredUsers = referralUsers.filter((user) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      user.email?.toLowerCase().includes(search) ||
      user.displayName?.toLowerCase().includes(search) ||
      user.referralCode?.toLowerCase().includes(search)
    );
  });

  // 推薦人表格欄位
  const columns = [
    {
      title: '用戶',
      key: 'user',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar src={record.photoURL} icon={<UserOutlined />} />
          <div>
            <div>
              <Text strong>{record.displayName || record.email?.split('@')[0] || '未知'}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '推薦碼',
      dataIndex: 'referralCode',
      key: 'referralCode',
      width: 150,
      render: (code) =>
        code ? (
          <Space>
            <Text code copyable={{ text: code }}>{code}</Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '推薦人數',
      dataIndex: 'referralCount',
      key: 'referralCount',
      width: 100,
      sorter: (a, b) => (a.referralCount || 0) - (b.referralCount || 0),
      render: (count) => (
        <Text strong style={{ color: count > 0 ? '#10b981' : '#9ca3af' }}>
          {count || 0} 人
        </Text>
      ),
    },
    {
      title: '推薦人',
      key: 'referredBy',
      width: 200,
      render: (_, record) => {
        if (!record.referredBy) return <Text type="secondary">-</Text>;
        const referrer = getReferrer(record.referredBy);
        return (
          <Tooltip title={`UID: ${record.referredBy}`}>
            <Space>
              <Avatar size="small" src={referrer?.photoURL} icon={<UserOutlined />} />
              <Text style={{ color: '#8b5cf6' }}>
                {referrer?.displayName || referrer?.email?.split('@')[0] || record.referredBy.slice(0, 8)}
              </Text>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: '身分組',
      dataIndex: 'primaryTierId',
      key: 'primaryTierId',
      width: 100,
      render: (tier) => {
        const tierMap = {
          founder: { label: '創始會員', color: 'gold' },
          paid: { label: '付費會員', color: 'blue' },
          referral_trial: { label: '推薦試用', color: 'purple' },
          trial: { label: '試用會員', color: 'green' },
          grace: { label: '寬限期', color: 'orange' },
          expired: { label: '已過期', color: 'red' },
        };
        const t = tierMap[tier] || { label: tier, color: 'default' };
        return <Tag color={t.color}>{t.label}</Tag>;
      },
    },
    {
      title: '付費獎勵',
      key: 'rewardStatus',
      width: 120,
      render: (_, record) => {
        if (!record.referredBy) return <Text type="secondary">-</Text>;
        if (record.referralRewardClaimed) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              已發放
            </Tag>
          );
        }
        if (record.primaryTierId === 'paid' || record.primaryTierId === 'founder') {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              已發放
            </Tag>
          );
        }
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            待付費
          </Tag>
        );
      },
    },
    {
      title: '被推薦人',
      key: 'referredUsers',
      width: 200,
      render: (_, record) => {
        if (record.referralCount === 0) return <Text type="secondary">-</Text>;
        const referred = getReferredUsers(record.id);
        return (
          <Tooltip
            title={
              <div>
                {referred.slice(0, 5).map((u) => (
                  <div key={u.id}>{u.displayName || u.email?.split('@')[0]}</div>
                ))}
                {referred.length > 5 && <div>...還有 {referred.length - 5} 人</div>}
              </div>
            }
          >
            <Space>
              <Avatar.Group maxCount={3} size="small">
                {referred.slice(0, 3).map((u) => (
                  <Avatar key={u.id} src={u.photoURL} icon={<UserOutlined />} />
                ))}
              </Avatar.Group>
              {referred.length > 3 && (
                <Text type="secondary">+{referred.length - 3}</Text>
              )}
            </Space>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* 統計卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="有推薦的用戶"
              value={stats.totalReferrers}
              prefix={<UsergroupAddOutlined style={{ color: '#10b981' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="被推薦用戶"
              value={stats.totalReferred}
              prefix={<UserOutlined style={{ color: '#8b5cf6' }} />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已發放獎勵"
              value={stats.totalRewardsGiven}
              prefix={<GiftOutlined style={{ color: '#f59e0b' }} />}
              suffix="筆"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待付費領取"
              value={stats.pendingRewards}
              prefix={<ClockCircleOutlined style={{ color: '#ef4444' }} />}
              suffix="人"
            />
          </Card>
        </Col>
      </Row>

      {/* 主表格 */}
      <Card
        title={
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UsergroupAddOutlined className="text-green-500" />
              推薦紀錄
            </h1>
            <p className="text-gray-500 mt-1">查看用戶推薦關係與獎勵狀態</p>
          </div>
        }
        extra={
          <Space>
            <Input
              placeholder="搜尋 Email / 名稱 / 推薦碼"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              重新載入
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="middle"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 推薦碼統計 */}
      <Card title="推薦碼使用統計" className="mt-6">
        <Table
          columns={[
            {
              title: '推薦碼',
              dataIndex: 'id',
              key: 'id',
              render: (code) => (
                <Text code copyable>{code}</Text>
              ),
            },
            {
              title: '擁有者',
              dataIndex: 'ownerId',
              key: 'ownerId',
              render: (ownerId) => {
                const owner = users.find((u) => u.id === ownerId);
                return owner ? (
                  <Space>
                    <Avatar size="small" src={owner.photoURL} icon={<UserOutlined />} />
                    <Text>{owner.displayName || owner.email?.split('@')[0]}</Text>
                  </Space>
                ) : (
                  <Text type="secondary">{ownerId?.slice(0, 8)}...</Text>
                );
              },
            },
            {
              title: '使用次數',
              dataIndex: 'usageCount',
              key: 'usageCount',
              sorter: (a, b) => (a.usageCount || 0) - (b.usageCount || 0),
              render: (count) => (
                <Text strong style={{ color: count > 0 ? '#10b981' : '#9ca3af' }}>
                  {count || 0} 次
                </Text>
              ),
            },
            {
              title: '狀態',
              dataIndex: 'isActive',
              key: 'isActive',
              render: (isActive) =>
                isActive !== false ? (
                  <Tag color="success">啟用</Tag>
                ) : (
                  <Tag color="default">停用</Tag>
                ),
            },
            {
              title: '建立時間',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (createdAt) =>
                createdAt?.toDate?.().toLocaleDateString('zh-TW') || '-',
            },
          ]}
          dataSource={referralCodes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Referrals;

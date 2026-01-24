import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Statistic, Tag, Modal, message } from 'antd';
import {
  UserAddOutlined,
  UserOutlined,
  RiseOutlined,
  PercentageOutlined,
  FileTextOutlined,
  PictureOutlined,
  InstagramOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { collection, query, where, getDocs, orderBy, limit, Timestamp, onSnapshot } from 'firebase/firestore';
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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineLoading, setOnlineLoading] = useState(true);
  const [contentModal, setContentModal] = useState({ visible: false, type: '', title: '' });

  // 內容管理點擊處理
  const handleContentClick = (type) => {
    const modalConfig = {
      quotes: { title: '每日金句（置中）管理', type: 'quotes' },
      ig: { title: 'IG 風格文案管理', type: 'ig' },
      backgrounds: { title: '背景圖庫管理', type: 'backgrounds' },
      blog: { title: '部落格文章管理', type: 'blog' },
    };
    setContentModal({ visible: true, ...modalConfig[type] });
  };

  // 獲取統計數據
  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
  }, []);

  // 即時監聽會員活動狀態（最近 30 分鐘內有活動視為線上）
  useEffect(() => {
    const thirtyMinsAgo = Timestamp.fromMillis(Date.now() - 30 * 60 * 1000);

    // 監聽最近有活動的用戶
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('lastLoginAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const lastLogin = data.lastLoginAt;
        const isOnline = lastLogin && lastLogin.toMillis() > thirtyMinsAgo.toMillis();

        users.push({
          key: doc.id,
          id: doc.id,
          ...data,
          isOnline,
        });
      });
      setOnlineUsers(users);
      setOnlineLoading(false);
    }, (error) => {
      console.error('Error listening to online users:', error);
      setOnlineLoading(false);
    });

    return () => unsubscribe();
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

  // 會員活動狀態表格列定義
  const onlineColumns = [
    {
      title: '會員',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (name, record) => (
        <div className="flex items-center gap-2">
          {record.photoURL ? (
            <img src={record.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs">
              {(name || record.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium">{name || '未設定'}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '上線狀態',
      dataIndex: 'isOnline',
      key: 'isOnline',
      width: 100,
      render: (isOnline) => (
        isOnline ? (
          <Tag icon={<CheckCircleOutlined />} color="success">線上</Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="default">離線</Tag>
        )
      ),
    },
    {
      title: '最後活動時間',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (timestamp) => {
        if (!timestamp) return <span className="text-gray-400">從未登入</span>;
        const date = timestamp.toDate();
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return <span className="text-green-500">剛剛</span>;
        if (diffMins < 60) return <span className="text-green-500">{diffMins} 分鐘前</span>;
        if (diffHours < 24) return <span className="text-yellow-500">{diffHours} 小時前</span>;
        if (diffDays < 7) return <span className="text-orange-500">{diffDays} 天前</span>;
        return <span className="text-gray-400">{dayjs(date).format('MM/DD HH:mm')}</span>;
      },
    },
    {
      title: '會員類型',
      dataIndex: 'primaryTierId',
      key: 'primaryTierId',
      width: 100,
      render: (tierId) => {
        const tierMap = {
          founder: { text: '創始會員', color: 'gold' },
          paid: { text: '付費會員', color: 'green' },
          trial: { text: '試用中', color: 'blue' },
          grace: { text: '寬限期', color: 'orange' },
          expired: { text: '已過期', color: 'default' },
        };
        const tier = tierMap[tierId] || { text: tierId || '未知', color: 'default' };
        return <Tag color={tier.color}>{tier.text}</Tag>;
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

      {/* 內容庫存 */}
      <Card title="📚 內容庫存" className="shadow-sm mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div
              onClick={() => handleContentClick('quotes')}
              className="cursor-pointer hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors group"
            >
              <Statistic
                title={
                  <span className="group-hover:text-blue-500 transition-colors">
                    每日金句（置中） <RightOutlined className="text-xs opacity-0 group-hover:opacity-100" />
                  </span>
                }
                value={95}
                prefix={<FileTextOutlined />}
                suffix="則"
                valueStyle={{ color: '#3b82f6' }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div
              onClick={() => handleContentClick('ig')}
              className="cursor-pointer hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors group"
            >
              <Statistic
                title={
                  <span className="group-hover:text-pink-500 transition-colors">
                    IG 風格文案 <RightOutlined className="text-xs opacity-0 group-hover:opacity-100" />
                  </span>
                }
                value={100}
                prefix={<InstagramOutlined />}
                suffix="則"
                valueStyle={{ color: '#e11d48' }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div
              onClick={() => handleContentClick('backgrounds')}
              className="cursor-pointer hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors group"
            >
              <Statistic
                title={
                  <span className="group-hover:text-emerald-500 transition-colors">
                    背景圖庫 <RightOutlined className="text-xs opacity-0 group-hover:opacity-100" />
                  </span>
                }
                value={90}
                prefix={<PictureOutlined />}
                suffix="張"
                valueStyle={{ color: '#10b981' }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div
              onClick={() => handleContentClick('blog')}
              className="cursor-pointer hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors group"
            >
              <Statistic
                title={
                  <span className="group-hover:text-amber-500 transition-colors">
                    部落格文章 <RightOutlined className="text-xs opacity-0 group-hover:opacity-100" />
                  </span>
                }
                value={38}
                prefix={<ReadOutlined />}
                suffix="篇"
                valueStyle={{ color: '#f59e0b' }}
              />
            </div>
          </Col>
        </Row>
        <div className="mt-4 text-xs text-gray-400">
          💡 點擊上方項目可查看內容清單
        </div>
      </Card>

      {/* 會員活動狀態 */}
      <Card
        title={
          <span>
            🟢 會員活動狀態
            <span className="ml-2 text-sm font-normal text-gray-400">
              （{onlineUsers.filter(u => u.isOnline).length} 人線上）
            </span>
          </span>
        }
        className="shadow-sm mb-6"
      >
        <Table
          columns={onlineColumns}
          dataSource={onlineUsers}
          loading={onlineLoading}
          pagination={false}
          size="small"
          locale={{ emptyText: '暫無會員資料' }}
        />
        <div className="mt-3 text-xs text-gray-400">
          💡 30 分鐘內有活動視為「線上」，每 30 秒自動更新
        </div>
      </Card>

      {/* 最新用戶 */}
      <Card title="最新用戶" className="shadow-sm">
        <Table
          columns={columns}
          dataSource={recentUsers}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 內容管理 Modal */}
      <Modal
        title={contentModal.title}
        open={contentModal.visible}
        onCancel={() => setContentModal({ visible: false, type: '', title: '' })}
        footer={null}
        width={700}
      >
        {contentModal.type === 'quotes' && (
          <div>
            <p className="text-gray-500 mb-4">每日金句用於「限時動態」功能的置中排版樣式。</p>
            <div className="bg-slate-100 rounded-lg p-4 mb-4">
              <p className="text-sm font-mono text-gray-600">
                📁 檔案位置：<code>src/data/dailyQuotes.ts</code>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                編輯 <code>dailyQuotes</code> 陣列即可新增或修改金句內容。
              </p>
            </div>
            <div className="text-sm text-gray-400">
              💡 建議使用 VS Code 直接編輯檔案，修改後會自動生效。
            </div>
          </div>
        )}
        {contentModal.type === 'ig' && (
          <div>
            <p className="text-gray-500 mb-4">IG 風格文案用於「限時動態」功能的左對齊排版樣式，包含黃色大標題和分段內文。</p>
            <div className="bg-slate-100 rounded-lg p-4 mb-4">
              <p className="text-sm font-mono text-gray-600">
                📁 檔案位置：<code>src/data/dailyQuotes.ts</code>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                編輯 <code>igStyleQuotes</code> 陣列，每則文案包含 <code>title</code>（標題）和 <code>lines</code>（內文陣列）。
              </p>
            </div>
            <div className="text-sm text-gray-400">
              💡 建議使用 VS Code 直接編輯檔案，修改後會自動生效。
            </div>
          </div>
        )}
        {contentModal.type === 'backgrounds' && (
          <div>
            <p className="text-gray-500 mb-4">背景圖庫用於「限時動態」功能的背景圖片，共有 7 個系列。</p>
            <div className="bg-slate-100 rounded-lg p-4 mb-4">
              <p className="text-sm font-mono text-gray-600">
                📁 檔案位置：<code>src/data/dailyQuotes.ts</code>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                編輯 <code>storyBackgrounds</code> 陣列，每張圖片包含 <code>id</code>、<code>imageUrl</code>、<code>series</code>。
              </p>
              <p className="text-sm text-gray-500 mt-1">
                系列：山脈、海洋、森林、沙漠&日落、湖泊&河流、雲&天空、星空&夜景
              </p>
            </div>
            <div className="text-sm text-gray-400">
              💡 圖片建議使用 Unsplash 免費圖庫，尺寸建議 1080x1920（9:16 直式）。
            </div>
          </div>
        )}
        {contentModal.type === 'blog' && (
          <div>
            <p className="text-gray-500 mb-4">部落格文章用於 SEO 內容行銷，目前共有 38 篇文章。</p>
            <div className="bg-slate-100 rounded-lg p-4 mb-4">
              <p className="text-sm font-mono text-gray-600">
                📁 檔案位置：<code>src/data/blog/articles/</code>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                每篇文章是一個獨立的 <code>.ts</code> 檔案，命名格式為 <code>XX-slug.ts</code>。
              </p>
              <p className="text-sm text-gray-500 mt-1">
                新增文章後需同步更新 <code>src/data/blog/index.ts</code> 和 <code>api/blog/[slug].ts</code>。
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <a
                href="https://ultra-advisor.tw/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                查看部落格前台 →
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Tooltip,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CrownOutlined,
  StarOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [tierModalVisible, setTierModalVisible] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    trial: 0,
    paid: 0,
    expired: 0,
  });

  // 載入用戶資料
  useEffect(() => {
    fetchUsers();
    fetchTiers();
  }, []);

  // 獲取身分組列表
  const fetchTiers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'membershipTiers'));
      const tiersList = [];
      snapshot.forEach((doc) => {
        tiersList.push({ id: doc.id, ...doc.data() });
      });
      tiersList.sort((a, b) => a.priority - b.priority);
      setTiers(tiersList);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    }
  };

  // 搜尋和篩選
  useEffect(() => {
    let filtered = users;

    // 搜尋
    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.id?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 篩選狀態
    if (filterStatus !== 'all') {
      filtered = filtered.filter((user) => {
        const status = user.primaryTierId || user.subscriptionStatus;
        return status === filterStatus;
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchText, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersQuery = collection(db, 'users');
      const snapshot = await getDocs(usersQuery);

      const usersList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          key: doc.id,
          id: doc.id,
          ...data,
        });
      });

      setUsers(usersList);
      setFilteredUsers(usersList);

      // 計算統計
      const stats = {
        total: usersList.length,
        trial: usersList.filter((u) => 
          (u.primaryTierId === 'trial' || u.subscriptionStatus === 'trial') && u.isActive
        ).length,
        paid: usersList.filter((u) => 
          u.primaryTierId === 'paid' || u.subscriptionStatus === 'paid'
        ).length,
        founder: usersList.filter((u) => 
          u.primaryTierId === 'founder' || u.membershipTierIds?.includes('founder')
        ).length,
        expired: usersList.filter((u) => !u.isActive).length,
      };
      setStats(stats);

      message.success('用戶資料載入成功');
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('載入用戶資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 延長試用
  const handleExtendTrial = async (values) => {
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const currentExpiry = selectedUser.trialExpiresAt;
      const newExpiry = Timestamp.fromMillis(
        currentExpiry.toMillis() + values.days * 24 * 60 * 60 * 1000
      );

      await updateDoc(userRef, {
        trialExpiresAt: newExpiry,
      });

      // 記錄操作日誌
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'USER_EXTEND_TRIAL',
        module: 'users',
        targetId: selectedUser.id,
        targetName: selectedUser.email,
        changes: {
          before: { trialExpiresAt: currentExpiry },
          after: { trialExpiresAt: newExpiry },
        },
        description: `延長用戶「${selectedUser.email}」試用期 ${values.days} 天`,
        createdAt: Timestamp.now(),
      });

      message.success(`已延長 ${values.days} 天試用期`);
      setExtendModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error extending trial:', error);
      message.error('延長試用期失敗');
    }
  };

  // 變更身分組
  const handleChangeTier = async (values) => {
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const oldTierIds = selectedUser.membershipTierIds || [selectedUser.primaryTierId || 'trial'];
      
      // 計算主要身分組（優先級最高的）
      const selectedTiers = tiers.filter(t => values.membershipTierIds.includes(t.id));
      selectedTiers.sort((a, b) => a.priority - b.priority);
      const primaryTierId = selectedTiers[0]?.id || values.membershipTierIds[0];

      await updateDoc(userRef, {
        membershipTierIds: values.membershipTierIds,
        primaryTierId: primaryTierId,
        subscriptionStatus: primaryTierId, // 兼容舊欄位
      });

      // 記錄操作日誌
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'USER_TIER_CHANGE',
        module: 'users',
        targetId: selectedUser.id,
        targetName: selectedUser.email,
        changes: {
          before: { membershipTierIds: oldTierIds },
          after: { membershipTierIds: values.membershipTierIds, primaryTierId },
        },
        description: `變更用戶「${selectedUser.email}」身分組為 [${values.membershipTierIds.join(', ')}]`,
        createdAt: Timestamp.now(),
      });

      message.success('身分組已更新');
      setTierModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error changing tier:', error);
      message.error('變更身分組失敗');
    }
  };

  // 刪除用戶
  const handleDeleteUser = async (userId, userEmail) => {
    try {
      await deleteDoc(doc(db, 'users', userId));

      // 記錄操作日誌
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'USER_DELETE',
        module: 'users',
        targetId: userId,
        targetName: userEmail,
        changes: { before: { id: userId, email: userEmail }, after: null },
        description: `刪除用戶「${userEmail}」`,
        createdAt: Timestamp.now(),
      });

      message.success('用戶已刪除');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('刪除用戶失敗');
    }
  };

  // 導出用戶資料
  const handleExport = () => {
    try {
      const csvContent = [
        ['Email', 'UID', '身分組', '點數', '註冊時間', '到期時間', 'LINE ID'].join(','),
        ...filteredUsers.map((user) =>
          [
            user.email,
            user.id,
            user.primaryTierId || user.subscriptionStatus,
            user.points || 0,
            user.createdAt ? dayjs(user.createdAt.toDate()).format('YYYY-MM-DD HH:mm') : '',
            user.trialExpiresAt ? dayjs(user.trialExpiresAt.toDate()).format('YYYY-MM-DD HH:mm') : '',
            user.lineUserId || '',
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `users_${dayjs().format('YYYY-MM-DD')}.csv`;
      link.click();

      message.success('用戶資料已導出');
    } catch (error) {
      console.error('Error exporting users:', error);
      message.error('導出失敗');
    }
  };

  // 獲取身分組標籤
  const getTierTag = (user) => {
    const tierId = user.primaryTierId || user.subscriptionStatus || 'trial';
    const tier = tiers.find(t => t.id === tierId);
    
    if (tier) {
      return (
        <Tag 
          style={{ 
            background: tier.badgeStyle?.background,
            borderColor: tier.badgeStyle?.border,
            color: tier.badgeStyle?.text,
          }}
        >
          {tier.icon} {tier.name?.replace(/[🏆💎🆓⏰❌]/g, '').trim()}
        </Tag>
      );
    }

    // 兼容舊資料
    const colors = {
      trial: 'blue',
      paid: 'green',
      founder: 'gold',
      expired: 'red',
    };
    const texts = {
      trial: '試用中',
      paid: '已付費',
      founder: '創始會員',
      expired: '已過期',
    };
    return <Tag color={colors[tierId] || 'default'}>{texts[tierId] || tierId}</Tag>;
  };

  // 表格欄位
  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      ellipsis: true,
    },
    {
      title: '身分組',
      key: 'tier',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {getTierTag(record)}
          {record.membershipTierIds?.length > 1 && (
            <Tooltip title={record.membershipTierIds.join(', ')}>
              <span className="text-xs text-gray-400">
                +{record.membershipTierIds.length - 1} 個身分組
              </span>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '點數',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (points) => (
        <Tooltip title={`累計獲得: ${points || 0}`}>
          <Badge count={points || 0} showZero overflowCount={9999} style={{ backgroundColor: '#a855f7' }} />
        </Tooltip>
      ),
    },
    {
      title: '推薦碼',
      dataIndex: 'referralCode',
      key: 'referralCode',
      width: 130,
      ellipsis: true,
      render: (code) => code ? <code className="text-xs">{code}</code> : '-',
    },
    {
      title: '註冊時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (timestamp) => {
        if (!timestamp) return '-';
        return dayjs(timestamp.toDate()).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      title: '到期時間',
      dataIndex: 'trialExpiresAt',
      key: 'expiresAt',
      width: 100,
      render: (timestamp, record) => {
        // 創始會員永久有效
        if (record.primaryTierId === 'founder' || record.membershipTierIds?.includes('founder')) {
          return <Tag color="gold">永久</Tag>;
        }
        if (!timestamp) return '-';
        const daysLeft = Math.ceil((timestamp.toMillis() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return <Tag color="red">已過期</Tag>;
        if (daysLeft <= 3) return <Tag color="orange">{daysLeft} 天</Tag>;
        return <Tag color="blue">{daysLeft} 天</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看詳情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="變更身分組">
            <Button
              type="link"
              size="small"
              icon={<CrownOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setTierModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="延長試用">
            <Button
              type="link"
              size="small"
              icon={<ClockCircleOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setExtendModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="確定要刪除此用戶嗎？"
            onConfirm={() => handleDeleteUser(record.id, record.email)}
            okText="確定"
            cancelText="取消"
          >
            <Tooltip title="刪除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👥 用戶管理</h1>

      {/* 統計卡片 */}
      <Card className="mb-6">
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic title="總用戶" value={stats.total} prefix={<UserOutlined />} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="創始會員" 
              value={stats.founder || 0} 
              valueStyle={{ color: '#f59e0b' }}
              prefix={<CrownOutlined />} 
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="付費會員" 
              value={stats.paid} 
              valueStyle={{ color: '#22c55e' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="試用中" 
              value={stats.trial} 
              valueStyle={{ color: '#3b82f6' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 篩選工具列 */}
      <Card className="mb-4">
        <Space wrap>
          <Search
            placeholder="搜尋 Email 或 UID"
            allowClear
            style={{ width: 250 }}
            onSearch={(v) => setSearchText(v)}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 140 }}
          >
            <Option value="all">全部狀態</Option>
            <Option value="founder">創始會員</Option>
            <Option value="paid">付費會員</Option>
            <Option value="trial">試用中</Option>
            <Option value="expired">已過期</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            重新載入
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            導出 CSV
          </Button>
        </Space>
      </Card>

      {/* 用戶表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 個用戶`,
          }}
        />
      </Card>

      {/* 用戶詳情 Modal */}
      <Modal
        title="👤 用戶詳情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            關閉
          </Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <Space direction="vertical" size="middle" className="w-full">
            <div><strong>📧 Email：</strong>{selectedUser.email}</div>
            <div><strong>🆔 UID：</strong><code className="text-xs">{selectedUser.id}</code></div>
            <div><strong>🏆 身分組：</strong>{getTierTag(selectedUser)}</div>
            <div><strong>💎 點數：</strong>{selectedUser.points || 0} 點</div>
            <div><strong>🎫 推薦碼：</strong>{selectedUser.referralCode || '(未設定)'}</div>
            <div><strong>👥 推薦人數：</strong>{selectedUser.referralCount || 0} 人</div>
            <div>
              <strong>📅 註冊時間：</strong>
              {selectedUser.createdAt 
                ? dayjs(selectedUser.createdAt.toDate()).format('YYYY-MM-DD HH:mm:ss')
                : '-'
              }
            </div>
            <div>
              <strong>⏰ 到期時間：</strong>
              {selectedUser.trialExpiresAt 
                ? dayjs(selectedUser.trialExpiresAt.toDate()).format('YYYY-MM-DD HH:mm:ss')
                : '-'
              }
            </div>
            <div><strong>📱 LINE ID：</strong>{selectedUser.lineUserId || '-'}</div>
          </Space>
        )}
      </Modal>

      {/* 延長試用 Modal */}
      <Modal
        title="⏱️ 延長試用期"
        open={extendModalVisible}
        onCancel={() => setExtendModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleExtendTrial} layout="vertical" initialValues={{ days: 7 }}>
          <Form.Item
            name="days"
            label="延長天數"
            rules={[{ required: true, message: '請輸入延長天數' }]}
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setExtendModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">確定延長</Button>
          </div>
        </Form>
      </Modal>

      {/* 變更身分組 Modal */}
      <Modal
        title="🏆 變更身分組"
        open={tierModalVisible}
        onCancel={() => setTierModalVisible(false)}
        footer={null}
      >
        <Form 
          onFinish={handleChangeTier} 
          layout="vertical"
          initialValues={{
            membershipTierIds: selectedUser?.membershipTierIds || 
              [selectedUser?.primaryTierId || selectedUser?.subscriptionStatus || 'trial']
          }}
        >
          <Form.Item
            name="membershipTierIds"
            label="選擇身分組（可多選）"
            rules={[{ required: true, message: '請選擇至少一個身分組' }]}
          >
            <Select mode="multiple" placeholder="選擇身分組">
              {tiers.map((tier) => (
                <Option key={tier.id} value={tier.id}>
                  {tier.icon} {tier.name?.replace(/[🏆💎🆓⏰❌]/g, '').trim()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <p className="text-xs text-gray-500 mb-4">
            * 優先級最高的身分組將作為主要身分組顯示
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setTierModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">確定變更</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;

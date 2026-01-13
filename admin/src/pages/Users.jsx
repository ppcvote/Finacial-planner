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
  DatePicker,
  Divider,
  Tooltip,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EditOutlined,
  CrownOutlined,
  PlusOutlined,
  MinusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, auth } from '../firebase';

// 初始化 Firebase Functions
const functions = getFunctions(undefined, 'us-central1');
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

// 身分組設定（新增 referral_trial）
const MEMBERSHIP_TIERS = [
  { id: 'founder', name: '創始會員', color: 'gold', icon: '👑' },
  { id: 'paid', name: '付費會員', color: 'blue', icon: '💎' },
  { id: 'referral_trial', name: '轉介紹試用', color: 'purple', icon: '🎁' },
  { id: 'trial', name: '試用會員', color: 'green', icon: '🎁' },
  { id: 'grace', name: '寬限期', color: 'orange', icon: '⏳' },
  { id: 'expired', name: '已過期', color: 'default', icon: '❌' },
];

// 天數方案
const DAYS_OPTIONS = [
  { value: 365, label: '365 天（年訂閱）- $8,999', amount: 8999 },
  { value: 180, label: '180 天（半年）- $4,999', amount: 4999 },
  { value: 30, label: '30 天（月訂閱）- $999', amount: 999 },
  { value: 7, label: '7 天（週訂閱）- $299', amount: 299 },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [processPaymentForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [processPaymentModalVisible, setProcessPaymentModalVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    trial: 0,
    paid: 0,
    expired: 0,
    founder: 0,
  });

  // 載入用戶資料
  useEffect(() => {
    fetchUsers();
  }, []);

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
      if (filterStatus === 'founder' || filterStatus === 'paid' || filterStatus === 'trial' || filterStatus === 'grace' || filterStatus === 'expired') {
        filtered = filtered.filter((user) => user.primaryTierId === filterStatus);
      } else {
        filtered = filtered.filter((user) => user.subscriptionStatus === filterStatus);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchText, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('=== Firebase 配置檢查 ===');
      console.log('Project ID:', db.app.options.projectId);
      console.log('當前登入用戶:', auth.currentUser?.email);

      const usersQuery = collection(db, 'users');
      const snapshot = await getDocs(usersQuery);

      console.log('查詢到的文檔數:', snapshot.size);

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
        founder: usersList.filter((u) => u.primaryTierId === 'founder').length,
        paid: usersList.filter((u) => u.primaryTierId === 'paid').length,
        trial: usersList.filter((u) => u.primaryTierId === 'trial' || u.subscriptionStatus === 'trial').length,
        expired: usersList.filter((u) => u.primaryTierId === 'expired' || !u.isActive).length,
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

  // 延長會員（快速按鈕）
  const handleQuickExtend = async (userId, days) => {
    try {
      const userRef = doc(db, 'users', userId);
      const user = users.find(u => u.id === userId);
      const currentExpiry = user?.membershipExpiresAt || user?.trialExpiresAt || Timestamp.now();
      const baseTime = currentExpiry.toMillis() > Date.now() ? currentExpiry.toMillis() : Date.now();
      const newExpiry = Timestamp.fromMillis(baseTime + days * 24 * 60 * 60 * 1000);

      await updateDoc(userRef, {
        membershipExpiresAt: newExpiry,
        trialExpiresAt: newExpiry, // 同步更新舊欄位
      });

      message.success(`已延長 ${days} 天`);
      fetchUsers();
    } catch (error) {
      console.error('Error extending membership:', error);
      message.error('延長失敗');
    }
  };

  // 開啟編輯 Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      primaryTierId: user.primaryTierId || 'trial',
      membershipExpiresAt: user.membershipExpiresAt
        ? dayjs(user.membershipExpiresAt.toDate())
        : user.trialExpiresAt
          ? dayjs(user.trialExpiresAt.toDate())
          : null,
      pointsCurrent: user.points?.current || 0,
      adminNote: user.adminNote || '',
    });
    setEditModalVisible(true);
  };

  // 儲存編輯
  const handleSaveEdit = async (values) => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const updateData = {
        primaryTierId: values.primaryTierId,
        adminNote: values.adminNote || '',
        updatedAt: Timestamp.now(),
        updatedBy: auth.currentUser?.email || 'admin',
      };

      // 更新到期日
      if (values.membershipExpiresAt) {
        const expiryTimestamp = Timestamp.fromDate(values.membershipExpiresAt.toDate());
        updateData.membershipExpiresAt = expiryTimestamp;
        updateData.trialExpiresAt = expiryTimestamp; // 同步舊欄位
      }

      // 更新點數
      if (values.pointsCurrent !== undefined) {
        updateData['points.current'] = values.pointsCurrent;
      }

      // 根據身分組更新 subscriptionStatus（向後相容）
      if (values.primaryTierId === 'paid' || values.primaryTierId === 'founder') {
        updateData.subscriptionStatus = 'paid';
        updateData.isActive = true;
      } else if (values.primaryTierId === 'trial') {
        updateData.subscriptionStatus = 'trial';
        updateData.isActive = true;
      } else if (values.primaryTierId === 'grace') {
        updateData.subscriptionStatus = 'trial';
        updateData.isActive = true;
      } else {
        updateData.subscriptionStatus = 'expired';
        updateData.isActive = false;
      }

      await updateDoc(userRef, updateData);

      message.success('用戶資料已更新');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('儲存失敗：' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 調整點數
  const adjustPoints = (amount) => {
    const current = editForm.getFieldValue('pointsCurrent') || 0;
    editForm.setFieldValue('pointsCurrent', Math.max(0, current + amount));
  };

  // 延長試用（舊功能保留）
  const handleExtendTrial = async (values) => {
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const currentExpiry = selectedUser.membershipExpiresAt || selectedUser.trialExpiresAt;
      const baseTime = currentExpiry?.toMillis() > Date.now() ? currentExpiry.toMillis() : Date.now();
      const newExpiry = Timestamp.fromMillis(baseTime + values.days * 24 * 60 * 60 * 1000);

      await updateDoc(userRef, {
        membershipExpiresAt: newExpiry,
        trialExpiresAt: newExpiry,
      });

      message.success(`已延長 ${values.days} 天`);
      setExtendModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error extending trial:', error);
      message.error('延長試用期失敗');
    }
  };

  // 刪除用戶
  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      message.success('用戶已刪除');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('刪除用戶失敗');
    }
  };

  // 🆕 處理付款訂單（呼叫 Cloud Function）
  const handleProcessPayment = async (values) => {
    setProcessingPayment(true);
    try {
      const processPayment = httpsCallable(functions, 'processPayment');
      const selectedOption = DAYS_OPTIONS.find(opt => opt.value === values.days);

      const result = await processPayment({
        userEmail: values.email,
        days: values.days,
        amount: selectedOption?.amount || 0,
        notes: values.notes || '',
      });

      if (result.data.success) {
        message.success(
          `處理成功！用戶現有 ${result.data.newDaysRemaining} 天` +
          (result.data.referralRewardGiven ? '（已發放推薦獎勵 +500 UA）' : '')
        );
        setProcessPaymentModalVisible(false);
        processPaymentForm.resetFields();
        fetchUsers();
      }
    } catch (error) {
      console.error('Process payment error:', error);
      message.error(error.message || '處理失敗');
    } finally {
      setProcessingPayment(false);
    }
  };

  // 導出用戶資料
  const handleExport = () => {
    try {
      const csvContent = [
        ['Email', 'UID', '身分組', '狀態', '點數', '註冊時間', '到期時間', 'LINE ID', '管理員備註'].join(','),
        ...filteredUsers.map((user) =>
          [
            user.email,
            user.id,
            user.primaryTierId || 'trial',
            user.subscriptionStatus,
            user.points?.current || 0,
            user.createdAt ? dayjs(user.createdAt.toDate()).format('YYYY-MM-DD HH:mm') : '',
            user.membershipExpiresAt
              ? dayjs(user.membershipExpiresAt.toDate()).format('YYYY-MM-DD HH:mm')
              : user.trialExpiresAt
                ? dayjs(user.trialExpiresAt.toDate()).format('YYYY-MM-DD HH:mm')
                : '',
            user.lineUserId || '',
            (user.adminNote || '').replace(/,/g, '，'),
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

  // 取得身分組顯示
  const getTierDisplay = (tierId) => {
    const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
    return tier || { id: tierId, name: tierId, color: 'default', icon: '❓' };
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
      dataIndex: 'primaryTierId',
      key: 'primaryTierId',
      width: 120,
      render: (tierId, record) => {
        const tier = getTierDisplay(tierId || (record.subscriptionStatus === 'paid' ? 'paid' : 'trial'));
        return (
          <Tag color={tier.color} icon={tier.id === 'founder' ? <CrownOutlined /> : null}>
            {tier.icon} {tier.name}
          </Tag>
        );
      },
    },
    {
      title: '點數',
      dataIndex: ['points', 'current'],
      key: 'points',
      width: 80,
      render: (points) => (
        <Text strong style={{ color: '#8b5cf6' }}>
          {points || 0} UA
        </Text>
      ),
    },
    {
      title: '到期時間',
      key: 'expiresAt',
      width: 130,
      render: (_, record) => {
        const timestamp = record.membershipExpiresAt || record.trialExpiresAt;
        if (!timestamp) return '-';
        const daysLeft = Math.ceil((timestamp.toMillis() - Date.now()) / (1000 * 60 * 60 * 24));
        const color = daysLeft <= 0 ? 'red' : daysLeft <= 3 ? 'orange' : daysLeft <= 7 ? '#faad14' : 'green';
        return (
          <Tooltip title={dayjs(timestamp.toDate()).format('YYYY-MM-DD HH:mm')}>
            <span style={{ color }}>
              {daysLeft > 0 ? `${daysLeft} 天後` : `已過期 ${Math.abs(daysLeft)} 天`}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '快速延長',
      key: 'quickExtend',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => handleQuickExtend(record.id, 7)}>+7天</Button>
          <Button size="small" onClick={() => handleQuickExtend(record.id, 30)}>+30天</Button>
          <Button size="small" onClick={() => handleQuickExtend(record.id, 365)}>+1年</Button>
        </Space>
      ),
    },
    {
      title: '備註',
      dataIndex: 'adminNote',
      key: 'adminNote',
      width: 150,
      ellipsis: true,
      render: (note) => note ? (
        <Tooltip title={note}>
          <Text type="secondary" ellipsis style={{ maxWidth: 140 }}>{note}</Text>
        </Tooltip>
      ) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="編輯用戶">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            >
              編輯
            </Button>
          </Tooltip>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setDetailModalVisible(true);
            }}
          >
            詳情
          </Button>
          <Popconfirm
            title="確定要刪除此用戶嗎？"
            description="此操作無法復原"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👥 用戶管理</h1>

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="總用戶數"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="👑 創始會員"
              value={stats.founder}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="💎 付費會員"
              value={stats.paid}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="🎁 試用中"
              value={stats.trial}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="❌ 已過期"
              value={stats.expired}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜尋和篩選 */}
      <Card className="mb-6">
        <Space className="w-full" direction="vertical" size="middle">
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Search
                placeholder="搜尋 Email 或 UID"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} md={14}>
              <Space wrap>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 150 }}
                  size="large"
                >
                  <Option value="all">全部狀態</Option>
                  <Option value="founder">👑 創始會員</Option>
                  <Option value="paid">💎 付費會員</Option>
                  <Option value="trial">🎁 試用中</Option>
                  <Option value="grace">⏳ 寬限期</Option>
                  <Option value="expired">❌ 已過期</Option>
                </Select>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchUsers}
                  size="large"
                >
                  重新載入
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  size="large"
                >
                  導出 CSV
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setProcessPaymentModalVisible(true)}
                  size="large"
                  style={{ backgroundColor: '#722ed1' }}
                >
                  處理訂單
                </Button>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* 用戶表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 個用戶`,
          }}
          size="middle"
        />
      </Card>

      {/* 🆕 編輯用戶 Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            編輯用戶：{selectedUser?.email}
          </Space>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveEdit}
          className="mt-4"
        >
          {/* 身分組選擇 */}
          <Form.Item
            name="primaryTierId"
            label="身分組"
            rules={[{ required: true, message: '請選擇身分組' }]}
          >
            <Select size="large">
              {MEMBERSHIP_TIERS.map(tier => (
                <Option key={tier.id} value={tier.id}>
                  <Space>
                    <span>{tier.icon}</span>
                    <span>{tier.name}</span>
                    <Tag color={tier.color} style={{ marginLeft: 8 }}>{tier.id}</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 到期日期 */}
          <Form.Item
            name="membershipExpiresAt"
            label="會員到期日"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              size="large"
              placeholder="選擇到期日期"
            />
          </Form.Item>

          {/* 快速延長按鈕 */}
          <Form.Item label="快速延長">
            <Space wrap>
              <Button
                onClick={() => {
                  const current = editForm.getFieldValue('membershipExpiresAt') || dayjs();
                  editForm.setFieldValue('membershipExpiresAt', current.add(7, 'day'));
                }}
              >
                +7 天
              </Button>
              <Button
                onClick={() => {
                  const current = editForm.getFieldValue('membershipExpiresAt') || dayjs();
                  editForm.setFieldValue('membershipExpiresAt', current.add(30, 'day'));
                }}
              >
                +30 天
              </Button>
              <Button
                onClick={() => {
                  const current = editForm.getFieldValue('membershipExpiresAt') || dayjs();
                  editForm.setFieldValue('membershipExpiresAt', current.add(90, 'day'));
                }}
              >
                +90 天
              </Button>
              <Button
                onClick={() => {
                  const current = editForm.getFieldValue('membershipExpiresAt') || dayjs();
                  editForm.setFieldValue('membershipExpiresAt', current.add(365, 'day'));
                }}
              >
                +365 天
              </Button>
            </Space>
          </Form.Item>

          <Divider />

          {/* 點數調整 */}
          <Form.Item label="UA 點數">
            <Space>
              <Button
                icon={<MinusOutlined />}
                onClick={() => adjustPoints(-10)}
                danger
              >
                -10
              </Button>
              <Button
                icon={<MinusOutlined />}
                onClick={() => adjustPoints(-1)}
              >
                -1
              </Button>
              <Form.Item name="pointsCurrent" noStyle>
                <InputNumber
                  min={0}
                  max={99999}
                  style={{ width: 100, textAlign: 'center' }}
                  size="large"
                />
              </Form.Item>
              <Button
                icon={<PlusOutlined />}
                onClick={() => adjustPoints(1)}
              >
                +1
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => adjustPoints(10)}
                type="primary"
              >
                +10
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => adjustPoints(100)}
                type="primary"
              >
                +100
              </Button>
            </Space>
          </Form.Item>

          <Divider />

          {/* 管理員備註 */}
          <Form.Item
            name="adminNote"
            label="管理員備註"
          >
            <TextArea
              rows={3}
              placeholder="輸入備註（例如：VIP 客戶、特殊折扣、問題記錄等）"
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 操作按鈕 */}
          <Form.Item className="mb-0 mt-6">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
              >
                儲存變更
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用戶詳情 Modal */}
      <Modal
        title="👤 用戶詳情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              openEditModal(selectedUser);
            }}
          >
            編輯用戶
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            關閉
          </Button>,
        ]}
        width={650}
      >
        {selectedUser && (
          <Space direction="vertical" size="middle" className="w-full">
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text type="secondary">📧 Email</Text>
                  <div><Text strong>{selectedUser.email}</Text></div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary">🆔 UID</Text>
                  <div><Text code copyable style={{ fontSize: 11 }}>{selectedUser.id}</Text></div>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text type="secondary">🏷️ 身分組</Text>
                  <div>
                    {(() => {
                      const tier = getTierDisplay(selectedUser.primaryTierId || 'trial');
                      return (
                        <Tag color={tier.color} style={{ marginTop: 4 }}>
                          {tier.icon} {tier.name}
                        </Tag>
                      );
                    })()}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary">💰 UA 點數</Text>
                  <div>
                    <Text strong style={{ color: '#8b5cf6', fontSize: 18 }}>
                      {selectedUser.points?.current || 0} UA
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text type="secondary">📅 註冊時間</Text>
                  <div>
                    <Text>
                      {selectedUser.createdAt
                        ? dayjs(selectedUser.createdAt.toDate()).format('YYYY-MM-DD HH:mm')
                        : '-'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary">⏰ 會員到期</Text>
                  <div>
                    {(() => {
                      const timestamp = selectedUser.membershipExpiresAt || selectedUser.trialExpiresAt;
                      if (!timestamp) return <Text>-</Text>;
                      const daysLeft = Math.ceil((timestamp.toMillis() - Date.now()) / (1000 * 60 * 60 * 24));
                      return (
                        <Text style={{ color: daysLeft <= 0 ? 'red' : daysLeft <= 7 ? 'orange' : 'green' }}>
                          {dayjs(timestamp.toDate()).format('YYYY-MM-DD HH:mm')}
                          <br />
                          <small>({daysLeft > 0 ? `剩餘 ${daysLeft} 天` : `已過期 ${Math.abs(daysLeft)} 天`})</small>
                        </Text>
                      );
                    })()}
                  </div>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text type="secondary">📱 LINE User ID</Text>
                  <div><Text code style={{ fontSize: 11 }}>{selectedUser.lineUserId || '-'}</Text></div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary">🔥 連續登入</Text>
                  <div><Text>{selectedUser.loginStreak || 0} 天</Text></div>
                </div>
              </Col>
            </Row>

            {selectedUser.adminNote && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text type="secondary">📝 管理員備註</Text>
                  <div style={{
                    marginTop: 4,
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    borderRadius: 6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    <Text>{selectedUser.adminNote}</Text>
                  </div>
                </div>
              </>
            )}
          </Space>
        )}
      </Modal>

      {/* 延長試用 Modal（保留舊功能） */}
      <Modal
        title="⏱️ 延長會員期限"
        open={extendModalVisible}
        onCancel={() => setExtendModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleExtendTrial} layout="vertical">
          <Form.Item
            name="days"
            label="延長天數"
            rules={[{ required: true, message: '請輸入延長天數' }]}
            initialValue={7}
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                確定延長
              </Button>
              <Button onClick={() => setExtendModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 🆕 處理訂單 Modal */}
      <Modal
        title={
          <Space>
            <CrownOutlined style={{ color: '#722ed1' }} />
            <span>處理付款訂單</span>
          </Space>
        }
        open={processPaymentModalVisible}
        onCancel={() => {
          setProcessPaymentModalVisible(false);
          processPaymentForm.resetFields();
        }}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={processPaymentForm}
          layout="vertical"
          onFinish={handleProcessPayment}
          className="mt-4"
        >
          {/* 用戶 Email */}
          <Form.Item
            name="email"
            label="用戶 Email"
            rules={[
              { required: true, message: '請輸入用戶 Email' },
              { type: 'email', message: '請輸入有效的 Email' },
            ]}
          >
            <Input
              placeholder="輸入已付款用戶的 Email"
              size="large"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          {/* 天數方案 */}
          <Form.Item
            name="days"
            label="購買方案"
            rules={[{ required: true, message: '請選擇方案' }]}
            initialValue={365}
          >
            <Select size="large" placeholder="選擇天數方案">
              {DAYS_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 備註 */}
          <Form.Item
            name="notes"
            label="訂單備註（選填）"
          >
            <TextArea
              rows={2}
              placeholder="例如：LINE Pay 訂單編號、銀行轉帳後五碼等"
              maxLength={200}
            />
          </Form.Item>

          {/* 提示訊息 */}
          <div style={{
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 6,
            padding: '12px 16px',
            marginBottom: 16,
          }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              💡 處理後系統將自動：
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                <li>為用戶增加購買天數</li>
                <li>更新用戶身分為「付費會員」</li>
                <li>若有推薦人，自動發放 +500 UA 獎勵</li>
                <li>記錄付款歷史</li>
              </ul>
            </Text>
          </div>

          {/* 操作按鈕 */}
          <Form.Item className="mb-0">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setProcessPaymentModalVisible(false);
                  processPaymentForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={processingPayment}
                icon={<SaveOutlined />}
                style={{ backgroundColor: '#722ed1' }}
              >
                確認處理
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;

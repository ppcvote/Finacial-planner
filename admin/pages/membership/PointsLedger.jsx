import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Statistic,
  DatePicker,
  Tooltip,
  Alert,
} from 'antd';
import {
  ReloadOutlined,
  HistoryOutlined,
  PlusOutlined,
  MinusOutlined,
  SearchOutlined,
  UserOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
  startAfter,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 交易類型
const TYPE_OPTIONS = [
  { value: 'earn', label: '獲得', color: 'green', icon: '+' },
  { value: 'spend', label: '消費', color: 'red', icon: '-' },
  { value: 'adjust', label: '調整', color: 'blue', icon: '±' },
  { value: 'expire', label: '過期', color: 'default', icon: '×' },
  { value: 'refund', label: '退款', color: 'orange', icon: '↩' },
];

const PointsLedger = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustForm] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    userId: null,
    type: null,
    dateRange: null,
  });
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    totalExpired: 0,
    netPoints: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 載入用戶列表（用於搜尋）
  useEffect(() => {
    fetchUsers();
  }, []);

  // 載入點數紀錄
  useEffect(() => {
    fetchEntries();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersList = [];
      snapshot.forEach((doc) => {
        usersList.push({
          id: doc.id,
          email: doc.data().email,
          displayName: doc.data().displayName,
        });
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let entriesQuery = query(
        collection(db, 'pointsLedger'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      // 套用篩選條件
      if (filters.userId) {
        entriesQuery = query(
          collection(db, 'pointsLedger'),
          where('userId', '==', filters.userId),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      }

      const snapshot = await getDocs(entriesQuery);
      
      let entriesList = [];
      snapshot.forEach((doc) => {
        entriesList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // 套用類型篩選
      if (filters.type) {
        entriesList = entriesList.filter(e => e.type === filters.type);
      }

      // 套用日期篩選
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const startDate = filters.dateRange[0].startOf('day').toDate();
        const endDate = filters.dateRange[1].endOf('day').toDate();
        entriesList = entriesList.filter(e => {
          const entryDate = e.createdAt?.toDate();
          return entryDate >= startDate && entryDate <= endDate;
        });
      }

      setEntries(entriesList);

      // 計算統計
      let totalEarned = 0, totalSpent = 0, totalExpired = 0;
      entriesList.forEach((entry) => {
        if (entry.type === 'earn' || entry.type === 'refund') {
          totalEarned += entry.amount;
        } else if (entry.type === 'spend') {
          totalSpent += Math.abs(entry.amount);
        } else if (entry.type === 'expire') {
          totalExpired += Math.abs(entry.amount);
        }
      });

      setStats({
        totalEarned,
        totalSpent,
        totalExpired,
        netPoints: totalEarned - totalSpent - totalExpired,
      });

      setPagination(prev => ({ ...prev, total: entriesList.length }));

      message.success('點數紀錄載入成功');
    } catch (error) {
      console.error('Error fetching entries:', error);
      message.error('載入點數紀錄失敗');
    } finally {
      setLoading(false);
    }
  };

  // 開啟調整點數 Modal
  const openAdjustModal = (user = null) => {
    setSelectedUser(user);
    adjustForm.resetFields();
    if (user) {
      adjustForm.setFieldsValue({ userId: user.id });
    }
    setAdjustModalVisible(true);
  };

  // 調整用戶點數
  const handleAdjustPoints = async (values) => {
    try {
      const userId = values.userId;
      const amount = values.type === 'add' ? values.amount : -values.amount;

      // 取得用戶資料
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        message.error('用戶不存在');
        return;
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;
      const newPoints = Math.max(0, currentPoints + amount);

      // 建立點數帳本記錄
      const ledgerEntry = {
        userId,
        userEmail: userData.email,
        type: 'adjust',
        amount,
        balanceBefore: currentPoints,
        balanceAfter: newPoints,
        actionId: 'admin_adjust',
        reason: values.reason || '管理員調整',
        referenceType: 'admin',
        multiplierApplied: 1,
        baseAmount: amount,
        isExpired: false,
        createdAt: Timestamp.now(),
        createdBy: auth.currentUser.uid,
      };

      // 如果是增加點數，設定過期時間（12 個月後）
      if (amount > 0) {
        ledgerEntry.expiresAt = Timestamp.fromMillis(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        );
      }

      await addDoc(collection(db, 'pointsLedger'), ledgerEntry);

      // 更新用戶點數
      const updateData = {
        points: newPoints,
      };
      if (amount > 0) {
        updateData.totalPointsEarned = (userData.totalPointsEarned || 0) + amount;
      } else {
        updateData.totalPointsSpent = (userData.totalPointsSpent || 0) + Math.abs(amount);
      }
      await updateDoc(userRef, updateData);

      // 記錄操作日誌
      await addDoc(collection(db, 'auditLogs'), {
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email,
        action: 'user.points.adjust',
        targetType: 'user',
        targetId: userId,
        changes: {
          before: { points: currentPoints },
          after: { points: newPoints },
          description: `調整用戶「${userData.email}」點數 ${amount > 0 ? '+' : ''}${amount}，原因：${values.reason || '管理員調整'}`,
        },
        createdAt: Timestamp.now(),
      });

      message.success(`已調整點數 ${amount > 0 ? '+' : ''}${amount}`);
      setAdjustModalVisible(false);
      fetchEntries();
    } catch (error) {
      console.error('Error adjusting points:', error);
      message.error('調整失敗');
    }
  };

  // 匯出 CSV
  const handleExport = () => {
    try {
      const csvContent = [
        ['時間', '用戶', '類型', '點數', '餘額', '原因', '來源'].join(','),
        ...entries.map((entry) => [
          entry.createdAt ? dayjs(entry.createdAt.toDate()).format('YYYY-MM-DD HH:mm:ss') : '',
          entry.userEmail,
          TYPE_OPTIONS.find(t => t.value === entry.type)?.label || entry.type,
          entry.amount,
          entry.balanceAfter,
          `"${entry.reason || ''}"`,
          entry.actionId,
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `points_ledger_${dayjs().format('YYYY-MM-DD')}.csv`;
      link.click();

      message.success('匯出成功');
    } catch (error) {
      console.error('Export error:', error);
      message.error('匯出失敗');
    }
  };

  // 表格欄位
  const columns = [
    {
      title: '時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (timestamp) => (
        timestamp ? dayjs(timestamp.toDate()).format('YYYY-MM-DD HH:mm') : '-'
      ),
    },
    {
      title: '用戶',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 200,
      ellipsis: true,
      render: (email, record) => (
        <Tooltip title={record.userId}>
          <span>{email}</span>
        </Tooltip>
      ),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => {
        const typeInfo = TYPE_OPTIONS.find(t => t.value === type);
        return <Tag color={typeInfo?.color}>{typeInfo?.label || type}</Tag>;
      },
    },
    {
      title: '點數',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount, record) => {
        const isPositive = amount > 0;
        return (
          <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{amount}
          </span>
        );
      },
    },
    {
      title: '餘額',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 100,
      render: (balance) => (
        <span className="font-medium">{balance} UA</span>
      ),
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
    },
    {
      title: '來源',
      dataIndex: 'actionId',
      key: 'actionId',
      width: 120,
      render: (actionId) => <Tag>{actionId}</Tag>,
    },
    {
      title: '倍率',
      dataIndex: 'multiplierApplied',
      key: 'multiplierApplied',
      width: 80,
      render: (multiplier) => (
        multiplier && multiplier !== 1 ? (
          <Tag color="gold">{multiplier}x</Tag>
        ) : null
      ),
    },
    {
      title: '過期時間',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 120,
      render: (timestamp, record) => {
        if (record.type !== 'earn') return null;
        if (!timestamp) return <Tag color="green">永久</Tag>;
        const date = timestamp.toDate();
        const isExpired = date < new Date();
        return (
          <Tag color={isExpired ? 'red' : 'default'}>
            {dayjs(date).format('YYYY-MM-DD')}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HistoryOutlined className="text-blue-500" />
            點數紀錄
          </h1>
          <p className="text-gray-500 mt-1">查詢與管理 UA 點數交易紀錄</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchEntries}>
            重新載入
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            匯出 CSV
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openAdjustModal()}>
            調整點數
          </Button>
        </Space>
      </div>

      {/* 統計卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總獲得"
              value={stats.totalEarned}
              valueStyle={{ color: '#52c41a' }}
              prefix={<PlusOutlined />}
              suffix="UA"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總消費"
              value={stats.totalSpent}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<MinusOutlined />}
              suffix="UA"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="總過期"
              value={stats.totalExpired}
              valueStyle={{ color: '#8c8c8c' }}
              suffix="UA"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="淨流通"
              value={stats.netPoints}
              valueStyle={{ color: '#1890ff' }}
              suffix="UA"
            />
          </Card>
        </Col>
      </Row>

      {/* 篩選器 */}
      <Card>
        <Space wrap size="middle">
          <Select
            placeholder="選擇用戶"
            style={{ width: 240 }}
            allowClear
            showSearch
            optionFilterProp="children"
            value={filters.userId}
            onChange={(value) => setFilters(prev => ({ ...prev, userId: value }))}
          >
            {users.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.email}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="交易類型"
            style={{ width: 120 }}
            allowClear
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            {TYPE_OPTIONS.map((type) => (
              <Option key={type.value} value={type.value}>
                <Tag color={type.color}>{type.label}</Tag>
              </Option>
            ))}
          </Select>

          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            placeholder={['開始日期', '結束日期']}
          />

          <Button 
            onClick={() => setFilters({ userId: null, type: null, dateRange: null })}
          >
            清除篩選
          </Button>
        </Space>
      </Card>

      {/* 點數紀錄列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={entries}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 筆紀錄`,
          }}
        />
      </Card>

      {/* 調整點數 Modal */}
      <Modal
        title="調整用戶點數"
        open={adjustModalVisible}
        onCancel={() => setAdjustModalVisible(false)}
        footer={null}
        width={480}
        destroyOnClose
      >
        <Alert
          message="注意事項"
          description="手動調整點數會記錄在操作日誌中，請謹慎操作並填寫原因。"
          type="warning"
          showIcon
          className="mb-4"
        />

        <Form
          form={adjustForm}
          layout="vertical"
          onFinish={handleAdjustPoints}
        >
          <Form.Item
            name="userId"
            label="選擇用戶"
            rules={[{ required: true, message: '請選擇用戶' }]}
          >
            <Select
              placeholder="搜尋用戶 Email"
              showSearch
              optionFilterProp="children"
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  <Space>
                    <UserOutlined />
                    {user.email}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="調整類型"
                rules={[{ required: true, message: '請選擇類型' }]}
                initialValue="add"
              >
                <Select>
                  <Option value="add">
                    <Tag color="green">增加點數</Tag>
                  </Option>
                  <Option value="subtract">
                    <Tag color="red">扣除點數</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="點數數量"
                rules={[{ required: true, message: '請輸入數量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="調整原因"
            rules={[{ required: true, message: '請填寫原因' }]}
          >
            <TextArea rows={3} placeholder="請詳細說明調整原因..." />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setAdjustModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                確認調整
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PointsLedger;

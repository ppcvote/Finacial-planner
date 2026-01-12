import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  message,
  Select,
  DatePicker,
  Modal,
  Form,
  InputNumber,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  MinusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const PointsLedger = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEntries();
  }, [filterType, dateRange]);

  // 獲取帳本記錄
  const fetchEntries = async () => {
    setLoading(true);
    try {
      let entriesQuery = query(
        collection(db, 'pointsLedger'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      // 如果有指定用戶 ID
      if (searchUserId) {
        entriesQuery = query(
          collection(db, 'pointsLedger'),
          where('userId', '==', searchUserId),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      }

      const snapshot = await getDocs(entriesQuery);
      let entriesList = [];
      snapshot.forEach((doc) => {
        entriesList.push({ key: doc.id, id: doc.id, ...doc.data() });
      });

      // 過濾類型
      if (filterType !== 'all') {
        entriesList = entriesList.filter((e) => e.type === filterType);
      }

      // 過濾日期
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].startOf('day').toDate();
        const end = dateRange[1].endOf('day').toDate();
        entriesList = entriesList.filter((e) => {
          const date = e.createdAt?.toDate();
          return date >= start && date <= end;
        });
      }

      setEntries(entriesList);
    } catch (error) {
      console.error('Error fetching entries:', error);
      // 如果是還沒有帳本，不顯示錯誤
      if (error.code !== 'failed-precondition') {
        message.error('載入帳本失敗');
      }
    } finally {
      setLoading(false);
    }
  };

  // 搜尋用戶
  const handleSearchUser = async (userId) => {
    setSearchUserId(userId);
    if (userId) {
      // 獲取用戶統計
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserStats({
            email: userData.email,
            points: userData.points || 0,
            totalEarned: userData.totalPointsEarned || 0,
            totalSpent: userData.totalPointsSpent || 0,
          });
          setSelectedUser({ id: userId, ...userData });
        } else {
          setUserStats(null);
          setSelectedUser(null);
          message.warning('找不到此用戶');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    } else {
      setUserStats(null);
      setSelectedUser(null);
    }
    fetchEntries();
  };

  // 開啟調整點數 Modal
  const openAdjustModal = () => {
    if (!selectedUser) {
      message.warning('請先搜尋並選擇用戶');
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      userId: selectedUser.id,
      userEmail: selectedUser.email,
    });
    setAdjustModalVisible(true);
  };

  // 調整點數
  const handleAdjustPoints = async (values) => {
    try {
      const userRef = doc(db, 'users', values.userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        message.error('用戶不存在');
        return;
      }

      const userData = userDoc.data();
      const currentPoints = userData.points || 0;
      const adjustAmount = values.adjustType === 'add' ? values.amount : -values.amount;
      const newBalance = currentPoints + adjustAmount;

      if (newBalance < 0) {
        message.error('調整後點數不能為負數');
        return;
      }

      // 更新用戶點數
      await updateDoc(userRef, {
        points: increment(adjustAmount),
        totalPointsEarned: values.adjustType === 'add' 
          ? increment(values.amount) 
          : increment(0),
        totalPointsSpent: values.adjustType === 'subtract' 
          ? increment(values.amount) 
          : increment(0),
      });

      // 新增帳本記錄
      const expiresAt = values.adjustType === 'add' 
        ? Timestamp.fromMillis(Date.now() + 365 * 24 * 60 * 60 * 1000) // 12 個月後過期
        : null;

      await addDoc(collection(db, 'pointsLedger'), {
        userId: values.userId,
        type: 'adjust',
        amount: adjustAmount,
        balanceBefore: currentPoints,
        balanceAfter: newBalance,
        ruleId: null,
        itemId: null,
        reason: values.reason,
        expiresAt: expiresAt,
        isExpired: false,
        referenceId: null,
        referenceType: 'admin_adjust',
        createdAt: Timestamp.now(),
        createdBy: auth.currentUser?.uid,
      });

      // 記錄操作日誌
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'POINTS_MANUAL_ADJUST',
        module: 'pointsLedger',
        targetId: values.userId,
        targetName: userData.email,
        changes: {
          before: { points: currentPoints },
          after: { points: newBalance },
        },
        description: `手動${values.adjustType === 'add' ? '增加' : '扣除'} ${values.amount} 點：${values.reason}`,
        createdAt: Timestamp.now(),
      });

      message.success('點數調整成功');
      setAdjustModalVisible(false);
      handleSearchUser(values.userId); // 重新載入用戶統計
    } catch (error) {
      console.error('Error adjusting points:', error);
      message.error('點數調整失敗');
    }
  };

  // 類型標籤
  const typeLabels = {
    earn: { text: '獲得', color: 'green' },
    spend: { text: '消費', color: 'red' },
    adjust: { text: '調整', color: 'orange' },
    expire: { text: '過期', color: 'default' },
  };

  // 表格列定義
  const columns = [
    {
      title: '時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (timestamp) => {
        if (!timestamp) return '-';
        return dayjs(timestamp.toDate()).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      title: '用戶',
      dataIndex: 'userId',
      key: 'userId',
      width: 150,
      ellipsis: true,
      render: (userId) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => handleSearchUser(userId)}
        >
          {userId.substring(0, 10)}...
        </Button>
      ),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => (
        <Tag color={typeLabels[type]?.color}>
          {typeLabels[type]?.text}
        </Tag>
      ),
    },
    {
      title: '點數',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount) => (
        <span className={amount >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {amount >= 0 ? `+${amount}` : amount}
        </span>
      ),
    },
    {
      title: '餘額',
      key: 'balance',
      width: 120,
      render: (_, record) => (
        <span className="text-gray-500">
          {record.balanceBefore} → {record.balanceAfter}
        </span>
      ),
    },
    {
      title: '說明',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '過期時間',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 120,
      render: (timestamp, record) => {
        if (!timestamp) return '-';
        if (record.isExpired) return <Tag color="default">已過期</Tag>;
        return dayjs(timestamp.toDate()).format('YYYY-MM-DD');
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">💰 點數帳本</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchEntries}>
            重新載入
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={openAdjustModal}
            disabled={!selectedUser}
          >
            調整點數
          </Button>
        </Space>
      </div>

      {/* 用戶統計卡片 */}
      {userStats && (
        <Card className="mb-6">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="用戶"
                value={userStats.email}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="當前點數"
                value={userStats.points}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="累計獲得"
                value={userStats.totalEarned}
                valueStyle={{ color: '#22c55e' }}
                prefix="+"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="累計消費"
                value={userStats.totalSpent}
                valueStyle={{ color: '#ef4444' }}
                prefix="-"
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* 篩選工具列 */}
      <Card className="mb-4">
        <Space wrap>
          <Search
            placeholder="輸入用戶 ID"
            allowClear
            enterButton="搜尋"
            style={{ width: 300 }}
            onSearch={handleSearchUser}
          />
          
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 120 }}
          >
            <Option value="all">全部類型</Option>
            <Option value="earn">獲得</Option>
            <Option value="spend">消費</Option>
            <Option value="adjust">調整</Option>
            <Option value="expire">過期</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={['開始日期', '結束日期']}
          />

          <Button onClick={() => {
            setSearchUserId('');
            setFilterType('all');
            setDateRange(null);
            setUserStats(null);
            setSelectedUser(null);
            fetchEntries();
          }}>
            清除篩選
          </Button>
        </Space>
      </Card>

      {/* 帳本表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={entries}
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* 調整點數 Modal */}
      <Modal
        title="✏️ 手動調整點數"
        open={adjustModalVisible}
        onCancel={() => setAdjustModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleAdjustPoints}>
          <Form.Item name="userId" label="用戶 ID">
            <Input disabled />
          </Form.Item>

          <Form.Item name="userEmail" label="用戶 Email">
            <Input disabled />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="adjustType"
              label="調整類型"
              rules={[{ required: true, message: '請選擇類型' }]}
            >
              <Select>
                <Option value="add">
                  <PlusOutlined className="text-green-500" /> 增加點數
                </Option>
                <Option value="subtract">
                  <MinusOutlined className="text-red-500" /> 扣除點數
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="點數數量"
              rules={[{ required: true, message: '請輸入數量' }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
            name="reason"
            label="調整原因"
            rules={[{ required: true, message: '請輸入原因' }]}
          >
            <Input.TextArea rows={2} placeholder="例如: 活動獎勵、補償、修正錯誤..." />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setAdjustModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              確認調整
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PointsLedger;

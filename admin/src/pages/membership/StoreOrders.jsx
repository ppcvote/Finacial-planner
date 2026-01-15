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
  Select,
  message,
  Tooltip,
  Row,
  Col,
  Statistic,
  Descriptions,
  Avatar,
} from 'antd';
import {
  ShoppingOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';

const { TextArea } = Input;
const { Option } = Select;

// 訂單狀態設定
const STATUS_OPTIONS = [
  { value: 'pending', label: '待處理', color: 'orange', icon: <ClockCircleOutlined /> },
  { value: 'processing', label: '處理中', color: 'blue', icon: <InboxOutlined /> },
  { value: 'shipped', label: '已出貨', color: 'purple', icon: <TruckOutlined /> },
  { value: 'completed', label: '已完成', color: 'green', icon: <CheckCircleOutlined /> },
  { value: 'cancelled', label: '已取消', color: 'default', icon: <CloseCircleOutlined /> },
];

// 分類設定
const CATEGORY_CONFIG = {
  subscription: { label: '訂閱延長', color: 'blue' },
  merchandise: { label: '實體商品', color: 'green' },
  digital: { label: '數位商品', color: 'purple' },
  experience: { label: '體驗服務', color: 'gold' },
};

const StoreOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
  });

  // 載入訂單
  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async (showMessage = false) => {
    setLoading(true);
    try {
      let ordersQuery;

      if (filterStatus === 'all') {
        ordersQuery = query(
          collection(db, 'redemptionOrders'),
          orderBy('createdAt', 'desc')
        );
      } else {
        ordersQuery = query(
          collection(db, 'redemptionOrders'),
          where('status', '==', filterStatus),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(ordersQuery);

      const ordersList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ordersList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
          completedAt: data.completedAt?.toDate?.(),
        });
      });

      setOrders(ordersList);

      // 計算統計
      const allOrders = await getDocs(query(collection(db, 'redemptionOrders')));
      const allOrdersList = allOrders.docs.map(d => d.data());

      setStats({
        total: allOrdersList.length,
        pending: allOrdersList.filter(o => o.status === 'pending').length,
        processing: allOrdersList.filter(o => o.status === 'processing').length,
        shipped: allOrdersList.filter(o => o.status === 'shipped').length,
        completed: allOrdersList.filter(o => o.status === 'completed').length,
      });

      if (showMessage) {
        message.success('訂單載入成功');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('載入訂單失敗');
    } finally {
      setLoading(false);
    }
  };

  // 開啟訂單處理 Modal
  const openModal = (order) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      adminNote: order.adminNote || '',
    });
    setModalVisible(true);
  };

  // 更新訂單狀態
  const handleUpdate = async (values) => {
    try {
      const updateData = {
        status: values.status,
        trackingNumber: values.trackingNumber || null,
        adminNote: values.adminNote || null,
        updatedAt: Timestamp.now(),
      };

      // 如果狀態改為已完成，記錄完成時間
      if (values.status === 'completed' && selectedOrder.status !== 'completed') {
        updateData.completedAt = Timestamp.now();
      }

      await updateDoc(doc(db, 'redemptionOrders', selectedOrder.id), updateData);

      // 記錄審計日誌
      await addDoc(collection(db, 'auditLogs'), {
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email,
        action: 'order.update',
        targetType: 'order',
        targetId: selectedOrder.id,
        changes: {
          before: {
            status: selectedOrder.status,
            trackingNumber: selectedOrder.trackingNumber,
          },
          after: {
            status: values.status,
            trackingNumber: values.trackingNumber,
          },
          description: `更新訂單 ${selectedOrder.orderNumber || selectedOrder.id.substring(0, 8)} 狀態為「${STATUS_OPTIONS.find(s => s.value === values.status)?.label}」`,
        },
        createdAt: Timestamp.now(),
      });

      message.success('訂單已更新');
      setModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('更新失敗');
    }
  };

  // 表格欄位
  const columns = [
    {
      title: '訂單編號',
      key: 'orderNumber',
      width: 140,
      render: (_, record) => (
        <span className="font-mono text-sm">
          {record.orderNumber || record.id.substring(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      title: '用戶',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" className="bg-purple-500">
            {record.userName?.[0] || record.userEmail?.[0] || '?'}
          </Avatar>
          <div>
            <div className="font-medium text-sm">{record.userName || '-'}</div>
            <div className="text-xs text-gray-400">{record.userEmail}</div>
          </div>
        </div>
      ),
    },
    {
      title: '商品',
      key: 'item',
      width: 220,
      render: (_, record) => (
        <Space>
          {record.itemImage ? (
            <img
              src={record.itemImage}
              alt={record.itemName}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
              🎁
            </div>
          )}
          <div>
            <div className="font-medium">{record.itemName}</div>
            {record.variant && (
              <div className="text-xs text-gray-400">規格：{record.variant}</div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => {
        const cat = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.merchandise;
        return <Tag color={cat.color}>{cat.label}</Tag>;
      },
    },
    {
      title: '點數',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      width: 100,
      render: (points) => (
        <span className="font-bold text-purple-600">-{points || 0} UA</span>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const s = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
        return (
          <Tag color={s.color} icon={s.icon}>
            {s.label}
          </Tag>
        );
      },
    },
    {
      title: '追蹤號碼',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      width: 120,
      render: (num) => num || <span className="text-gray-400">-</span>,
    },
    {
      title: '兌換時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => date ? (
        <div className="text-sm">
          <div>{date.toLocaleDateString('zh-TW')}</div>
          <div className="text-gray-400">{date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      ) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="處理訂單">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingOutlined className="text-purple-500" />
            兌換訂單管理
          </h1>
          <p className="text-gray-500 mt-1">管理用戶的商城兌換訂單</p>
        </div>
        <Space>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 120 }}
          >
            <Option value="all">全部狀態</Option>
            {STATUS_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => fetchOrders(true)}>
            重新載入
          </Button>
        </Space>
      </div>

      {/* 統計卡片 */}
      <Row gutter={16}>
        <Col span={4}>
          <Card>
            <Statistic
              title="總訂單數"
              value={stats.total}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="待處理"
              value={stats.pending}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="處理中"
              value={stats.processing}
              valueStyle={{ color: '#1890ff' }}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="已出貨"
              value={stats.shipped}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TruckOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 訂單列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `共 ${total} 筆訂單`,
          }}
        />
      </Card>

      {/* 訂單處理 Modal */}
      <Modal
        title={`訂單處理 #${selectedOrder?.orderNumber || selectedOrder?.id?.substring(0, 8)?.toUpperCase()}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedOrder && (
          <>
            {/* 訂單詳情 */}
            <Descriptions
              bordered
              size="small"
              column={2}
              className="mb-6"
            >
              <Descriptions.Item label="商品" span={2}>
                <Space>
                  {selectedOrder.itemImage && (
                    <img
                      src={selectedOrder.itemImage}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{selectedOrder.itemName}</div>
                    {selectedOrder.variant && (
                      <div className="text-gray-400">規格：{selectedOrder.variant}</div>
                    )}
                  </div>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="點數">
                <span className="font-bold text-purple-600">
                  -{selectedOrder.pointsCost} UA
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="兌換時間">
                {selectedOrder.createdAt?.toLocaleString('zh-TW')}
              </Descriptions.Item>
              <Descriptions.Item label="用戶">
                {selectedOrder.userName || selectedOrder.userEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.userEmail}
              </Descriptions.Item>

              {/* 收件資訊（實體商品） */}
              {selectedOrder.shippingInfo && (
                <>
                  <Descriptions.Item label="收件人" span={2}>
                    {selectedOrder.shippingInfo.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="手機">
                    {selectedOrder.shippingInfo.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="地址" span={2}>
                    {selectedOrder.shippingInfo.address}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            {/* 狀態更新表單 */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
            >
              <Form.Item
                name="status"
                label="訂單狀態"
                rules={[{ required: true, message: '請選擇狀態' }]}
              >
                <Select>
                  {STATUS_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      <Space>
                        {opt.icon}
                        {opt.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="trackingNumber"
                label="物流追蹤號碼"
              >
                <Input placeholder="如：123456789" />
              </Form.Item>

              <Form.Item
                name="adminNote"
                label="管理員備註"
              >
                <TextArea rows={2} placeholder="內部備註，用戶不會看到" />
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Space>
                  <Button onClick={() => setModalVisible(false)}>取消</Button>
                  <Button type="primary" htmlType="submit">
                    更新狀態
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default StoreOrders;

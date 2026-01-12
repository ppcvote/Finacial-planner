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
  Switch,
  Select,
  message,
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider,
  Image,
  Popconfirm,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';

const { TextArea } = Input;
const { Option } = Select;

// 分類選項
const CATEGORY_OPTIONS = [
  { value: 'subscription', label: '訂閱延長', color: 'blue', icon: '📅' },
  { value: 'merchandise', label: '實體商品', color: 'green', icon: '🎁' },
  { value: 'digital', label: '數位商品', color: 'purple', icon: '💎' },
  { value: 'experience', label: '體驗服務', color: 'gold', icon: '⭐' },
];

const RedeemableItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalRedeemed: 0,
  });

  // 載入兌換商品
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const itemsQuery = query(
        collection(db, 'redeemableItems'),
        orderBy('sortOrder', 'asc')
      );
      const snapshot = await getDocs(itemsQuery);
      
      const itemsList = [];
      snapshot.forEach((doc) => {
        itemsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setItems(itemsList);

      // 計算統計
      const activeCount = itemsList.filter(i => i.isActive).length;
      const totalRedeemed = itemsList.reduce((sum, i) => sum + (i.stockUsed || 0), 0);

      setStats({
        total: itemsList.length,
        active: activeCount,
        totalRedeemed,
      });

      message.success('兌換商品載入成功');
    } catch (error) {
      console.error('Error fetching items:', error);
      message.error('載入兌換商品失敗');
    } finally {
      setLoading(false);
    }
  };

  // 開啟新增/編輯 Modal
  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        sortOrder: items.length + 1,
        pointsCost: 100,
        stock: -1,
        stockUsed: 0,
        maxPerUser: -1,
        category: 'merchandise',
        requiresShipping: false,
        isActive: true,
        isFeatured: false,
      });
    }
    setModalVisible(true);
  };

  // 儲存商品
  const handleSave = async (values) => {
    try {
      const itemData = {
        ...values,
        updatedAt: Timestamp.now(),
      };

      if (editingItem) {
        // 更新
        await updateDoc(doc(db, 'redeemableItems', editingItem.id), itemData);
        
        // 記錄操作日誌
        await addDoc(collection(db, 'auditLogs'), {
          adminId: auth.currentUser.uid,
          adminEmail: auth.currentUser.email,
          action: 'item.update',
          targetType: 'item',
          targetId: editingItem.id,
          changes: {
            before: editingItem,
            after: itemData,
            description: `更新兌換商品「${itemData.name}」`,
          },
          createdAt: Timestamp.now(),
        });

        message.success('商品已更新');
      } else {
        // 新增
        itemData.createdAt = Timestamp.now();
        itemData.stockUsed = 0;
        
        const docRef = await addDoc(collection(db, 'redeemableItems'), itemData);
        
        // 記錄操作日誌
        await addDoc(collection(db, 'auditLogs'), {
          adminId: auth.currentUser.uid,
          adminEmail: auth.currentUser.email,
          action: 'item.create',
          targetType: 'item',
          targetId: docRef.id,
          changes: {
            after: itemData,
            description: `建立兌換商品「${itemData.name}」`,
          },
          createdAt: Timestamp.now(),
        });

        message.success('商品已建立');
      }

      setModalVisible(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      message.error('儲存失敗');
    }
  };

  // 刪除商品
  const handleDelete = async (item) => {
    try {
      // 檢查是否有未完成的兌換訂單
      const ordersQuery = query(
        collection(db, 'redemptionOrders'),
        where('itemId', '==', item.id),
        where('status', 'in', ['pending', 'processing'])
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      if (!ordersSnapshot.empty) {
        message.error(`無法刪除：有 ${ordersSnapshot.size} 筆未完成的兌換訂單`);
        return;
      }

      await deleteDoc(doc(db, 'redeemableItems', item.id));

      // 記錄操作日誌
      await addDoc(collection(db, 'auditLogs'), {
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email,
        action: 'item.delete',
        targetType: 'item',
        targetId: item.id,
        changes: {
          before: item,
          description: `刪除兌換商品「${item.name}」`,
        },
        createdAt: Timestamp.now(),
      });

      message.success('商品已刪除');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('刪除失敗');
    }
  };

  // 切換啟用狀態
  const handleToggleActive = async (item) => {
    try {
      const newStatus = !item.isActive;
      await updateDoc(doc(db, 'redeemableItems', item.id), {
        isActive: newStatus,
        updatedAt: Timestamp.now(),
      });

      // 記錄操作日誌
      await addDoc(collection(db, 'auditLogs'), {
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email,
        action: 'item.toggle',
        targetType: 'item',
        targetId: item.id,
        changes: {
          before: { isActive: item.isActive },
          after: { isActive: newStatus },
          description: `${newStatus ? '上架' : '下架'}兌換商品「${item.name}」`,
        },
        createdAt: Timestamp.now(),
      });

      message.success(`已${newStatus ? '上架' : '下架'}商品`);
      fetchItems();
    } catch (error) {
      console.error('Error toggling item:', error);
      message.error('操作失敗');
    }
  };

  // 表格欄位
  const columns = [
    {
      title: '商品',
      key: 'name',
      width: 280,
      render: (_, record) => (
        <Space>
          {record.image ? (
            <Image
              src={record.image}
              width={60}
              height={60}
              className="rounded-lg object-cover"
              fallback="https://placehold.co/60x60/e2e8f0/64748b?text=No+Image"
            />
          ) : (
            <div className="w-[60px] h-[60px] bg-slate-100 rounded-lg flex items-center justify-center">
              <PictureOutlined className="text-slate-400 text-xl" />
            </div>
          )}
          <div>
            <div className="font-medium flex items-center gap-2">
              {record.name}
              {record.isFeatured && <Tag color="gold">精選</Tag>}
            </div>
            <div className="text-xs text-gray-400 max-w-[180px] truncate">
              {record.description}
            </div>
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
        const cat = CATEGORY_OPTIONS.find(c => c.value === category);
        return (
          <Tag color={cat?.color || 'default'}>
            {cat?.icon} {cat?.label || category}
          </Tag>
        );
      },
    },
    {
      title: '點數',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      width: 100,
      render: (points) => (
        <span className="font-bold text-amber-600">{points} UA</span>
      ),
    },
    {
      title: '庫存',
      key: 'stock',
      width: 150,
      render: (_, record) => {
        if (record.stock === -1) {
          return <Tag color="green">無限</Tag>;
        }
        const remaining = record.stock - (record.stockUsed || 0);
        const percent = ((record.stockUsed || 0) / record.stock) * 100;
        return (
          <div className="w-[100px]">
            <div className="text-xs mb-1">
              剩餘 {remaining} / {record.stock}
            </div>
            <Progress 
              percent={percent} 
              size="small" 
              showInfo={false}
              status={remaining <= 10 ? 'exception' : 'normal'}
            />
          </div>
        );
      },
    },
    {
      title: '已兌換',
      dataIndex: 'stockUsed',
      key: 'stockUsed',
      width: 80,
      render: (count) => <Tag color="blue">{count || 0} 次</Tag>,
    },
    {
      title: '每人限制',
      dataIndex: 'maxPerUser',
      key: 'maxPerUser',
      width: 100,
      render: (max) => (
        max === -1 ? <Tag color="green">無限</Tag> : <Tag>{max} 次</Tag>
      ),
    },
    {
      title: '需寄送',
      dataIndex: 'requiresShipping',
      key: 'requiresShipping',
      width: 80,
      render: (requires) => (
        requires ? <Tag color="orange">是</Tag> : <Tag color="default">否</Tag>
      ),
    },
    {
      title: '狀態',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="上架"
          unCheckedChildren="下架"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="編輯">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="確定要刪除此商品？"
            onConfirm={() => handleDelete(record)}
            okText="確定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="刪除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
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
            <ShoppingOutlined className="text-green-500" />
            兌換商品
          </h1>
          <p className="text-gray-500 mt-1">管理 UA 點數可兌換的商品與服務</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchItems}>
            重新載入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增商品
          </Button>
        </Space>
      </div>

      {/* 統計卡片 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="商品總數"
              value={stats.total}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="上架中"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="總兌換次數"
              value={stats.totalRedeemed}
              valueStyle={{ color: '#1890ff' }}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 商品列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 項商品`,
          }}
        />
      </Card>

      {/* 新增/編輯 Modal */}
      <Modal
        title={editingItem ? '編輯商品' : '新增商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="商品名稱"
            rules={[{ required: true, message: '請輸入名稱' }]}
          >
            <Input placeholder="如：Ultra Advisor 限定 T-Shirt" />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品說明"
          >
            <TextArea rows={3} placeholder="商品說明文字" />
          </Form.Item>

          <Form.Item
            name="image"
            label="商品圖片 URL"
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="分類"
                rules={[{ required: true, message: '請選擇分類' }]}
              >
                <Select placeholder="選擇分類">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pointsCost"
                label="所需點數"
                rules={[{ required: true, message: '請輸入點數' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="庫存數量"
                tooltip="-1 表示無限"
              >
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxPerUser"
                label="每人限制"
                tooltip="-1 表示無限"
              >
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sortOrder"
                label="排序"
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>訂閱延長設定（僅限訂閱延長類別）</Divider>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.category !== cur.category}
          >
            {({ getFieldValue }) => (
              getFieldValue('category') === 'subscription' && (
                <Form.Item
                  name={['autoAction', 'days']}
                  label="延長天數"
                >
                  <InputNumber min={1} style={{ width: '100%' }} placeholder="如：7" />
                </Form.Item>
              )
            )}
          </Form.Item>

          <Divider>其他設定</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="requiresShipping"
                valuePropName="checked"
              >
                <Switch /> 需要寄送
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isFeatured"
                valuePropName="checked"
              >
                <Switch /> 精選商品
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isActive"
                valuePropName="checked"
              >
                <Switch /> 立即上架
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? '儲存變更' : '建立商品'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RedeemableItems;

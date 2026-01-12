import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Tag,
  message,
  Popconfirm,
  Select,
  Image,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const { Option } = Select;

const RedeemableItems = () => {
  const [items, setItems] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchItems();
    fetchTiers();
  }, []);

  // 獲取商品列表
  const fetchItems = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'redeemableItems'));
      const itemsList = [];
      snapshot.forEach((doc) => {
        itemsList.push({ key: doc.id, id: doc.id, ...doc.data() });
      });
      setItems(itemsList);
    } catch (error) {
      console.error('Error fetching items:', error);
      message.error('載入商品失敗');
    } finally {
      setLoading(false);
    }
  };

  // 獲取身分組（用於限制設定）
  const fetchTiers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'membershipTiers'));
      const tiersList = [];
      snapshot.forEach((doc) => {
        tiersList.push({ id: doc.id, ...doc.data() });
      });
      setTiers(tiersList);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    }
  };

  // 開啟新增/編輯 Modal
  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        membershipRequired: item.limits?.membershipRequired || [],
        perUserMax: item.limits?.perUserMax,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        isFeatured: false,
        category: 'merchandise',
        stock: -1,
        stockUsed: 0,
      });
    }
    setModalVisible(true);
  };

  // 儲存商品
  const handleSave = async (values) => {
    try {
      const itemData = {
        id: values.id,
        name: values.name,
        description: values.description,
        image: values.image || '',
        category: values.category,
        pointsCost: values.pointsCost,
        stock: values.stock,
        stockUsed: values.stockUsed || 0,
        limits: {
          perUserMax: values.perUserMax || null,
          membershipRequired: values.membershipRequired || [],
        },
        isActive: values.isActive,
        isFeatured: values.isFeatured,
        updatedAt: Timestamp.now(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'redeemableItems', editingItem.id), itemData);
        message.success('商品已更新');
        
        await addDoc(collection(db, 'operationLogs'), {
          operatorId: auth.currentUser?.uid,
          operatorEmail: auth.currentUser?.email,
          action: 'ITEM_UPDATE',
          module: 'redeemableItems',
          targetId: editingItem.id,
          targetName: itemData.name,
          changes: { before: editingItem, after: itemData },
          description: `更新兌換商品「${itemData.name}」`,
          createdAt: Timestamp.now(),
        });
      } else {
        const itemId = values.id || `item_${Date.now()}`;
        itemData.id = itemId;
        itemData.createdAt = Timestamp.now();
        itemData.createdBy = auth.currentUser?.uid;
        
        await setDoc(doc(db, 'redeemableItems', itemId), itemData);
        message.success('商品已建立');
        
        await addDoc(collection(db, 'operationLogs'), {
          operatorId: auth.currentUser?.uid,
          operatorEmail: auth.currentUser?.email,
          action: 'ITEM_CREATE',
          module: 'redeemableItems',
          targetId: itemId,
          targetName: itemData.name,
          changes: { before: null, after: itemData },
          description: `建立兌換商品「${itemData.name}」`,
          createdAt: Timestamp.now(),
        });
      }

      setModalVisible(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      message.error('儲存失敗');
    }
  };

  // 切換啟用狀態
  const handleToggle = async (item) => {
    try {
      await updateDoc(doc(db, 'redeemableItems', item.id), {
        isActive: !item.isActive,
        updatedAt: Timestamp.now(),
      });
      message.success(`已${item.isActive ? '停用' : '啟用'}商品`);
      
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'ITEM_TOGGLE',
        module: 'redeemableItems',
        targetId: item.id,
        targetName: item.name,
        changes: { before: { isActive: item.isActive }, after: { isActive: !item.isActive } },
        description: `${item.isActive ? '停用' : '啟用'}兌換商品「${item.name}」`,
        createdAt: Timestamp.now(),
      });
      
      fetchItems();
    } catch (error) {
      console.error('Error toggling item:', error);
      message.error('操作失敗');
    }
  };

  // 刪除商品
  const handleDelete = async (item) => {
    try {
      await deleteDoc(doc(db, 'redeemableItems', item.id));
      message.success('商品已刪除');
      
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'ITEM_DELETE',
        module: 'redeemableItems',
        targetId: item.id,
        targetName: item.name,
        changes: { before: item, after: null },
        description: `刪除兌換商品「${item.name}」`,
        createdAt: Timestamp.now(),
      });
      
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('刪除失敗');
    }
  };

  // 分類標籤
  const categoryLabels = {
    subscription: { text: '訂閱', color: 'blue' },
    merchandise: { text: '實體', color: 'green' },
    digital: { text: '數位', color: 'purple' },
  };

  // 表格列定義
  const columns = [
    {
      title: '商品',
      key: 'product',
      width: 280,
      render: (_, record) => (
        <Space>
          {record.image ? (
            <Image src={record.image} width={50} height={50} className="rounded" />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
              <GiftOutlined className="text-gray-400 text-xl" />
            </div>
          )}
          <div>
            <div className="font-medium">
              {record.name}
              {record.isFeatured && <Tag color="red" className="ml-2">推薦</Tag>}
            </div>
            <div className="text-xs text-gray-500">{record.id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      width: 80,
      render: (category) => (
        <Tag color={categoryLabels[category]?.color}>
          {categoryLabels[category]?.text}
        </Tag>
      ),
    },
    {
      title: '所需點數',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      width: 100,
      render: (cost) => <Tag color="gold">{cost} 點</Tag>,
    },
    {
      title: '庫存',
      key: 'stock',
      width: 120,
      render: (_, record) => {
        if (record.stock === -1) {
          return <Tag color="blue">無限</Tag>;
        }
        const remaining = record.stock - (record.stockUsed || 0);
        return (
          <Badge
            count={remaining}
            showZero
            overflowCount={999}
            style={{ 
              backgroundColor: remaining > 10 ? '#52c41a' : remaining > 0 ? '#faad14' : '#ff4d4f' 
            }}
          />
        );
      },
    },
    {
      title: '已兌換',
      dataIndex: 'stockUsed',
      key: 'stockUsed',
      width: 80,
      render: (used) => <span className="text-gray-500">{used || 0} 件</span>,
    },
    {
      title: '狀態',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggle(record)}
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            size="small"
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除此商品嗎？"
            onConfirm={() => handleDelete(record)}
            okText="確定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              刪除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎁 兌換商品管理</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchItems}>
            重新載入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增商品
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 新增/編輯 Modal */}
      <Modal
        title={editingItem ? '編輯兌換商品' : '新增兌換商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="id"
              label="識別碼 (ID)"
              rules={[{ required: !editingItem, message: '請輸入識別碼' }]}
            >
              <Input placeholder="例如: brand_tshirt" disabled={!!editingItem} />
            </Form.Item>

            <Form.Item
              name="category"
              label="分類"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="subscription">訂閱延長</Option>
                <Option value="merchandise">實體商品</Option>
                <Option value="digital">數位商品</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label="商品名稱"
            rules={[{ required: true, message: '請輸入名稱' }]}
          >
            <Input placeholder="例如: Ultra Advisor 品牌 T-Shirt" />
          </Form.Item>

          <Form.Item name="description" label="商品說明">
            <Input.TextArea rows={2} placeholder="商品說明文字" />
          </Form.Item>

          <Form.Item name="image" label="商品圖片 URL">
            <Input placeholder="https://example.com/image.png" />
          </Form.Item>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="pointsCost"
              label="所需點數"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item
              name="stock"
              label="庫存數量"
              tooltip="-1 表示無限"
            >
              <InputNumber min={-1} className="w-full" />
            </Form.Item>

            <Form.Item name="stockUsed" label="已兌換數量">
              <InputNumber min={0} className="w-full" disabled={!editingItem} />
            </Form.Item>
          </div>

          <Card title="兌換限制" size="small" className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="perUserMax" label="每人最多兌換">
                <InputNumber min={0} className="w-full" placeholder="不填=無限" />
              </Form.Item>

              <Form.Item name="membershipRequired" label="需要身分組">
                <Select mode="multiple" placeholder="不選=所有人可兌換">
                  {tiers.map((tier) => (
                    <Option key={tier.id} value={tier.id}>
                      {tier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Form.Item name="isActive" valuePropName="checked">
              <Switch checkedChildren="上架" unCheckedChildren="下架" />
            </Form.Item>

            <Form.Item name="isFeatured" valuePropName="checked">
              <Switch checkedChildren="推薦" unCheckedChildren="一般" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingItem ? '更新' : '建立'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RedeemableItems;

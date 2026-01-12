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
  ColorPicker,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  query,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const MembershipTiers = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTiers();
  }, []);

  // 獲取身分組列表
  const fetchTiers = async () => {
    setLoading(true);
    try {
      const tiersQuery = query(
        collection(db, 'membershipTiers'),
        orderBy('priority', 'asc')
      );
      const snapshot = await getDocs(tiersQuery);
      const tiersList = [];
      snapshot.forEach((doc) => {
        tiersList.push({ key: doc.id, id: doc.id, ...doc.data() });
      });
      setTiers(tiersList);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      message.error('載入身分組失敗');
    } finally {
      setLoading(false);
    }
  };

  // 開啟新增/編輯 Modal
  const openModal = (tier = null) => {
    setEditingTier(tier);
    if (tier) {
      form.setFieldsValue({
        ...tier,
        color: tier.color,
        permissions: tier.permissions || {},
        benefits: tier.benefits?.join('\n') || '',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        isPermanent: false,
        isDefault: false,
        pointsMultiplier: 1.0,
        priority: tiers.length + 1,
        permissions: {
          canUseTools: true,
          canExport: true,
          canAccessAI: true,
          maxClients: -1,
          canEarnPoints: true,
          canRedeemPoints: true,
        },
      });
    }
    setModalVisible(true);
  };

  // 儲存身分組
  const handleSave = async (values) => {
    try {
      const tierData = {
        ...values,
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString() || '#3b82f6',
        benefits: values.benefits?.split('\n').filter(b => b.trim()) || [],
        badgeStyle: {
          background: `${typeof values.color === 'string' ? values.color : values.color?.toHexString() || '#3b82f6'}33`,
          border: typeof values.color === 'string' ? values.color : values.color?.toHexString() || '#3b82f6',
          text: typeof values.color === 'string' ? values.color : values.color?.toHexString() || '#3b82f6',
        },
        updatedAt: Timestamp.now(),
      };

      if (editingTier) {
        // 更新
        await updateDoc(doc(db, 'membershipTiers', editingTier.id), tierData);
        message.success('身分組已更新');
        
        // 記錄操作日誌
        await addDoc(collection(db, 'operationLogs'), {
          operatorId: auth.currentUser?.uid,
          operatorEmail: auth.currentUser?.email,
          action: 'TIER_UPDATE',
          module: 'membershipTiers',
          targetId: editingTier.id,
          targetName: tierData.name,
          changes: {
            before: editingTier,
            after: tierData,
          },
          description: `更新身分組「${tierData.name}」`,
          createdAt: Timestamp.now(),
        });
      } else {
        // 新增
        const tierId = values.id || `tier_${Date.now()}`;
        tierData.id = tierId;
        tierData.createdAt = Timestamp.now();
        tierData.createdBy = auth.currentUser?.uid;
        
        await setDoc(doc(db, 'membershipTiers', tierId), tierData);
        message.success('身分組已建立');
        
        // 記錄操作日誌
        await addDoc(collection(db, 'operationLogs'), {
          operatorId: auth.currentUser?.uid,
          operatorEmail: auth.currentUser?.email,
          action: 'TIER_CREATE',
          module: 'membershipTiers',
          targetId: tierId,
          targetName: tierData.name,
          changes: {
            before: null,
            after: tierData,
          },
          description: `建立身分組「${tierData.name}」`,
          createdAt: Timestamp.now(),
        });
      }

      setModalVisible(false);
      fetchTiers();
    } catch (error) {
      console.error('Error saving tier:', error);
      message.error('儲存失敗');
    }
  };

  // 切換啟用狀態
  const handleToggle = async (tier) => {
    try {
      await updateDoc(doc(db, 'membershipTiers', tier.id), {
        isActive: !tier.isActive,
        updatedAt: Timestamp.now(),
      });
      message.success(`已${tier.isActive ? '停用' : '啟用'}身分組`);
      
      // 記錄操作日誌
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'TIER_TOGGLE',
        module: 'membershipTiers',
        targetId: tier.id,
        targetName: tier.name,
        changes: {
          before: { isActive: tier.isActive },
          after: { isActive: !tier.isActive },
        },
        description: `${tier.isActive ? '停用' : '啟用'}身分組「${tier.name}」`,
        createdAt: Timestamp.now(),
      });
      
      fetchTiers();
    } catch (error) {
      console.error('Error toggling tier:', error);
      message.error('操作失敗');
    }
  };

  // 刪除身分組
  const handleDelete = async (tier) => {
    try {
      await deleteDoc(doc(db, 'membershipTiers', tier.id));
      message.success('身分組已刪除');
      
      // 記錄操作日誌
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'TIER_DELETE',
        module: 'membershipTiers',
        targetId: tier.id,
        targetName: tier.name,
        changes: {
          before: tier,
          after: null,
        },
        description: `刪除身分組「${tier.name}」`,
        createdAt: Timestamp.now(),
      });
      
      fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      message.error('刪除失敗');
    }
  };

  // 表格列定義
  const columns = [
    {
      title: '優先級',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: '身分組',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Tag 
            style={{ 
              background: record.badgeStyle?.background || 'rgba(59, 130, 246, 0.2)',
              borderColor: record.badgeStyle?.border || '#3b82f6',
              color: record.badgeStyle?.text || '#3b82f6',
            }}
          >
            {record.icon} {name}
          </Tag>
          {record.isPermanent && (
            <Tooltip title="永久有效">
              <Badge status="success" text="永久" />
            </Tooltip>
          )}
          {record.isDefault && (
            <Tooltip title="新用戶預設">
              <Badge status="processing" text="預設" />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '點數倍率',
      dataIndex: 'pointsMultiplier',
      key: 'pointsMultiplier',
      width: 100,
      render: (val) => <Tag color="purple">{val}x</Tag>,
    },
    {
      title: '權限',
      key: 'permissions',
      width: 180,
      render: (_, record) => (
        <Space wrap size="small">
          <Tooltip title="使用工具">
            {record.permissions?.canUseTools ? 
              <CheckCircleOutlined className="text-green-500" /> : 
              <CloseCircleOutlined className="text-red-500" />
            }
          </Tooltip>
          <Tooltip title="匯出報表">
            {record.permissions?.canExport ? 
              <CheckCircleOutlined className="text-green-500" /> : 
              <CloseCircleOutlined className="text-red-500" />
            }
          </Tooltip>
          <Tooltip title="AI 功能">
            {record.permissions?.canAccessAI ? 
              <CheckCircleOutlined className="text-green-500" /> : 
              <CloseCircleOutlined className="text-red-500" />
            }
          </Tooltip>
          <Tooltip title="獲得點數">
            {record.permissions?.canEarnPoints ? 
              <CheckCircleOutlined className="text-green-500" /> : 
              <CloseCircleOutlined className="text-red-500" />
            }
          </Tooltip>
          <Tooltip title="兌換點數">
            {record.permissions?.canRedeemPoints ? 
              <CheckCircleOutlined className="text-green-500" /> : 
              <CloseCircleOutlined className="text-red-500" />
            }
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除此身分組嗎？"
            onConfirm={() => handleDelete(record)}
            okText="確定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
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
        <h1 className="text-2xl font-bold">🎖️ 身分組管理</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTiers}>
            重新載入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增身分組
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tiers}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 新增/編輯 Modal */}
      <Modal
        title={editingTier ? '編輯身分組' : '新增身分組'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="id"
              label="識別碼 (ID)"
              rules={[{ required: !editingTier, message: '請輸入識別碼' }]}
              tooltip="唯一識別碼，建立後不可更改"
            >
              <Input 
                placeholder="例如: vip, premium" 
                disabled={!!editingTier}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label="優先級"
              rules={[{ required: true, message: '請輸入優先級' }]}
              tooltip="數字越小越優先（用於多重身分組時顯示）"
            >
              <InputNumber min={1} max={100} className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="名稱"
              rules={[{ required: true, message: '請輸入名稱' }]}
            >
              <Input placeholder="例如: 🏆 VIP 會員" />
            </Form.Item>

            <Form.Item
              name="icon"
              label="圖示 (Emoji)"
            >
              <Input placeholder="例如: 🏆" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="說明"
          >
            <Input.TextArea rows={2} placeholder="身分組說明文字" />
          </Form.Item>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="color"
              label="顏色"
            >
              <ColorPicker />
            </Form.Item>

            <Form.Item
              name="pointsMultiplier"
              label="點數倍率"
              tooltip="獲得點數時的加成倍率"
            >
              <InputNumber min={0} max={10} step={0.1} className="w-full" />
            </Form.Item>

            <Form.Item
              name={['permissions', 'maxClients']}
              label="最大客戶數"
              tooltip="-1 表示無限"
            >
              <InputNumber min={-1} className="w-full" />
            </Form.Item>
          </div>

          <Card title="權限設定" size="small" className="mb-4">
            <div className="grid grid-cols-3 gap-4">
              <Form.Item
                name={['permissions', 'canUseTools']}
                valuePropName="checked"
              >
                <Switch checkedChildren="可使用工具" unCheckedChildren="禁用工具" />
              </Form.Item>

              <Form.Item
                name={['permissions', 'canExport']}
                valuePropName="checked"
              >
                <Switch checkedChildren="可匯出報表" unCheckedChildren="禁止匯出" />
              </Form.Item>

              <Form.Item
                name={['permissions', 'canAccessAI']}
                valuePropName="checked"
              >
                <Switch checkedChildren="可用 AI" unCheckedChildren="禁用 AI" />
              </Form.Item>

              <Form.Item
                name={['permissions', 'canEarnPoints']}
                valuePropName="checked"
              >
                <Switch checkedChildren="可獲點數" unCheckedChildren="禁止獲點" />
              </Form.Item>

              <Form.Item
                name={['permissions', 'canRedeemPoints']}
                valuePropName="checked"
              >
                <Switch checkedChildren="可兌換" unCheckedChildren="禁止兌換" />
              </Form.Item>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Form.Item
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="啟用" unCheckedChildren="停用" />
            </Form.Item>

            <Form.Item
              name="isPermanent"
              valuePropName="checked"
              tooltip="永久有效，不會過期"
            >
              <Switch checkedChildren="永久" unCheckedChildren="有期限" />
            </Form.Item>

            <Form.Item
              name="isDefault"
              valuePropName="checked"
              tooltip="新用戶預設身分組"
            >
              <Switch checkedChildren="預設" unCheckedChildren="非預設" />
            </Form.Item>
          </div>

          <Form.Item
            name="benefits"
            label="權益說明 (每行一項)"
          >
            <Input.TextArea rows={4} placeholder="每行輸入一項權益說明" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingTier ? '更新' : '建立'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MembershipTiers;

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
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
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
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const { Option } = Select;

const PointsRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRules();
  }, []);

  // 獲取點數規則列表
  const fetchRules = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'pointsRules'));
      const rulesList = [];
      snapshot.forEach((doc) => {
        rulesList.push({ key: doc.id, id: doc.id, ...doc.data() });
      });
      setRules(rulesList);
    } catch (error) {
      console.error('Error fetching rules:', error);
      message.error('載入點數規則失敗');
    } finally {
      setLoading(false);
    }
  };

  // 開啟新增/編輯 Modal
  const openModal = (rule = null) => {
    setEditingRule(rule);
    if (rule) {
      form.setFieldsValue({
        ...rule,
        dailyMax: rule.limits?.dailyMax,
        weeklyMax: rule.limits?.weeklyMax,
        monthlyMax: rule.limits?.monthlyMax,
        totalMax: rule.limits?.totalMax,
        cooldownMinutes: rule.limits?.cooldownMinutes,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        isSystemRule: false,
        category: 'engagement',
        points: 10,
        cooldownMinutes: 0,
      });
    }
    setModalVisible(true);
  };

  // 儲存規則
  const handleSave = async (values) => {
    try {
      const ruleData = {
        id: values.id,
        name: values.name,
        description: values.description,
        icon: values.icon || '⭐',
        category: values.category,
        points: values.points,
        limits: {
          dailyMax: values.dailyMax || null,
          weeklyMax: values.weeklyMax || null,
          monthlyMax: values.monthlyMax || null,
          totalMax: values.totalMax || null,
          cooldownMinutes: values.cooldownMinutes || 0,
        },
        isActive: values.isActive,
        isSystemRule: values.isSystemRule || false,
        updatedAt: Timestamp.now(),
      };

      if (editingRule) {
        await updateDoc(doc(db, 'pointsRules', editingRule.id), ruleData);
        message.success('規則已更新');
        
        await addDoc(collection(db, 'operationLogs'), {
          operatorId: auth.currentUser?.uid,
          operatorEmail: auth.currentUser?.email,
          action: 'RULE_UPDATE',
          module: 'pointsRules',
          targetId: editingRule.id,
          targetName: ruleData.name,
          changes: { before: editingRule, after: ruleData },
          description: `更新點數規則「${ruleData.name}」`,
          createdAt: Timestamp.now(),
        });
      } else {
        const ruleId = values.id || `rule_${Date.now()}`;
        ruleData.id = ruleId;
        ruleData.createdAt = Timestamp.now();
        
        await setDoc(doc(db, 'pointsRules', ruleId), ruleData);
        message.success('規則已建立');
        
        await addDoc(collection(db, 'operationLogs'), {
          operatorId: auth.currentUser?.uid,
          operatorEmail: auth.currentUser?.email,
          action: 'RULE_CREATE',
          module: 'pointsRules',
          targetId: ruleId,
          targetName: ruleData.name,
          changes: { before: null, after: ruleData },
          description: `建立點數規則「${ruleData.name}」`,
          createdAt: Timestamp.now(),
        });
      }

      setModalVisible(false);
      fetchRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      message.error('儲存失敗');
    }
  };

  // 切換啟用狀態
  const handleToggle = async (rule) => {
    try {
      await updateDoc(doc(db, 'pointsRules', rule.id), {
        isActive: !rule.isActive,
        updatedAt: Timestamp.now(),
      });
      message.success(`已${rule.isActive ? '停用' : '啟用'}規則`);
      
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'RULE_TOGGLE',
        module: 'pointsRules',
        targetId: rule.id,
        targetName: rule.name,
        changes: { before: { isActive: rule.isActive }, after: { isActive: !rule.isActive } },
        description: `${rule.isActive ? '停用' : '啟用'}點數規則「${rule.name}」`,
        createdAt: Timestamp.now(),
      });
      
      fetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      message.error('操作失敗');
    }
  };

  // 刪除規則
  const handleDelete = async (rule) => {
    if (rule.isSystemRule) {
      message.error('系統規則不可刪除');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'pointsRules', rule.id));
      message.success('規則已刪除');
      
      await addDoc(collection(db, 'operationLogs'), {
        operatorId: auth.currentUser?.uid,
        operatorEmail: auth.currentUser?.email,
        action: 'RULE_DELETE',
        module: 'pointsRules',
        targetId: rule.id,
        targetName: rule.name,
        changes: { before: rule, after: null },
        description: `刪除點數規則「${rule.name}」`,
        createdAt: Timestamp.now(),
      });
      
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      message.error('刪除失敗');
    }
  };

  // 分類顏色
  const categoryColors = {
    engagement: 'blue',
    referral: 'green',
    activity: 'purple',
    admin: 'orange',
  };

  const categoryLabels = {
    engagement: '互動',
    referral: '推薦',
    activity: '活動',
    admin: '管理員',
  };

  // 表格列定義
  const columns = [
    {
      title: '圖示',
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon) => <span className="text-2xl">{icon}</span>,
    },
    {
      title: '規則名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <span>{name}</span>
          {record.isSystemRule && <Tag color="red">系統</Tag>}
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
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      width: 80,
      render: (category) => (
        <Tag color={categoryColors[category]}>
          {categoryLabels[category]}
        </Tag>
      ),
    },
    {
      title: '點數',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (points) => (
        <Tag color="gold">+{points}</Tag>
      ),
    },
    {
      title: '限制',
      key: 'limits',
      width: 200,
      render: (_, record) => {
        const limits = [];
        if (record.limits?.dailyMax) limits.push(`日上限 ${record.limits.dailyMax}`);
        if (record.limits?.totalMax) limits.push(`總上限 ${record.limits.totalMax}`);
        if (record.limits?.cooldownMinutes > 0) limits.push(`冷卻 ${record.limits.cooldownMinutes}分`);
        return limits.length > 0 ? (
          <Tooltip title={limits.join(' / ')}>
            <span className="text-xs text-gray-500">{limits[0]}...</span>
          </Tooltip>
        ) : (
          <span className="text-gray-400">無限制</span>
        );
      },
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
          {!record.isSystemRule && (
            <Popconfirm
              title="確定要刪除此規則嗎？"
              onConfirm={() => handleDelete(record)}
              okText="確定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />} size="small">
                刪除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">💎 點數規則管理</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchRules}>
            重新載入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增規則
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={rules}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 新增/編輯 Modal */}
      <Modal
        title={editingRule ? '編輯點數規則' : '新增點數規則'}
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
              rules={[{ required: !editingRule, message: '請輸入識別碼' }]}
            >
              <Input placeholder="例如: bonus_login" disabled={!!editingRule} />
            </Form.Item>

            <Form.Item
              name="category"
              label="分類"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="engagement">互動</Option>
                <Option value="referral">推薦</Option>
                <Option value="activity">活動</Option>
                <Option value="admin">管理員</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="規則名稱"
              rules={[{ required: true, message: '請輸入名稱' }]}
            >
              <Input placeholder="例如: 每日登入" />
            </Form.Item>

            <Form.Item name="icon" label="圖示 (Emoji)">
              <Input placeholder="例如: 📅" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="說明">
            <Input.TextArea rows={2} placeholder="規則說明" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="points"
              label="獲得點數"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item name="cooldownMinutes" label="冷卻時間 (分鐘)">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>

          <Card title="限制設定" size="small" className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="dailyMax" label="每日上限">
                <InputNumber min={0} className="w-full" placeholder="不填=無限" />
              </Form.Item>

              <Form.Item name="weeklyMax" label="每週上限">
                <InputNumber min={0} className="w-full" placeholder="不填=無限" />
              </Form.Item>

              <Form.Item name="monthlyMax" label="每月上限">
                <InputNumber min={0} className="w-full" placeholder="不填=無限" />
              </Form.Item>

              <Form.Item name="totalMax" label="總上限">
                <InputNumber min={0} className="w-full" placeholder="不填=無限" />
              </Form.Item>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Form.Item name="isActive" valuePropName="checked">
              <Switch checkedChildren="啟用" unCheckedChildren="停用" />
            </Form.Item>

            <Form.Item name="isSystemRule" valuePropName="checked">
              <Switch checkedChildren="系統規則" unCheckedChildren="自訂規則" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingRule ? '更新' : '建立'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PointsRules;

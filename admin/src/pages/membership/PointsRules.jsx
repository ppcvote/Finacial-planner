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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';

const { TextArea } = Input;
const { Option } = Select;

// 分類選項
const CATEGORY_OPTIONS = [
  { value: 'engagement', label: '互動行為', color: 'blue' },
  { value: 'referral', label: '推薦獎勵', color: 'green' },
  { value: 'activity', label: '活動參與', color: 'purple' },
  { value: 'bonus', label: '額外獎勵', color: 'gold' },
];

// 觸發方式
const TRIGGER_OPTIONS = [
  { value: 'auto', label: '自動觸發', description: '系統自動判斷並發放' },
  { value: 'manual', label: '手動發放', description: '需由管理員手動操作' },
  { value: 'api', label: 'API 觸發', description: '透過 API 呼叫發放' },
];

// Emoji 選項
const EMOJI_OPTIONS = ['📅', '🛠️', '👤', '🎁', '🎉', '🎪', '💡', '🔥', '⚙️', '⭐', '💰', '🏅'];

const PointsRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalPointsIssued: 0,
  });
  const [updatingReferral, setUpdatingReferral] = useState(false);

  // 🆕 一鍵更新推薦獎勵規則
  const handleUpdateReferralRules = async () => {
    setUpdatingReferral(true);
    try {
      const updatePointsRules = httpsCallable(functions, 'updatePointsRules');
      const result = await updatePointsRules();
      if (result.data.success) {
        message.success(result.data.message);
        fetchRules(); // 重新載入規則
      }
    } catch (error) {
      console.error('Update referral rules error:', error);
      message.error(error.message || '更新失敗');
    } finally {
      setUpdatingReferral(false);
    }
  };

  // 載入點數規則
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const rulesQuery = query(
        collection(db, 'pointsRules'),
        orderBy('priority', 'asc')
      );
      const snapshot = await getDocs(rulesQuery);
      
      const rulesList = [];
      snapshot.forEach((doc) => {
        rulesList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setRules(rulesList);

      // 計算統計
      const activeCount = rulesList.filter(r => r.isActive).length;

      // 計算總發放點數（從 pointsLedger）
      const ledgerSnapshot = await getDocs(
        query(collection(db, 'pointsLedger'))
      );
      let totalIssued = 0;
      ledgerSnapshot.forEach((doc) => {
        const entry = doc.data();
        if (entry.type === 'earn') {
          totalIssued += entry.amount;
        }
      });

      setStats({
        total: rulesList.length,
        active: activeCount,
        totalPointsIssued: totalIssued,
      });

      message.success('點數規則載入成功');
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
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        priority: rules.length + 1,
        basePoints: 10,
        category: 'engagement',
        triggerType: 'auto',
        isActive: true,
        limits: {},
      });
    }
    setModalVisible(true);
  };

  // 儲存規則
  const handleSave = async (values) => {
    try {
      const ruleData = {
        ...values,
        updatedAt: Timestamp.now(),
      };

      if (editingRule) {
        // 更新
        await updateDoc(doc(db, 'pointsRules', editingRule.id), ruleData);
        
        // 記錄操作日誌
        await addDoc(collection(db, 'auditLogs'), {
          adminId: auth.currentUser.uid,
          adminEmail: auth.currentUser.email,
          action: 'rule.update',
          targetType: 'rule',
          targetId: editingRule.id,
          changes: {
            before: editingRule,
            after: ruleData,
            description: `更新點數規則「${ruleData.name}」`,
          },
          createdAt: Timestamp.now(),
        });

        message.success('點數規則已更新');
      } else {
        // 新增
        ruleData.createdAt = Timestamp.now();
        
        const docRef = await addDoc(collection(db, 'pointsRules'), ruleData);
        
        // 記錄操作日誌
        await addDoc(collection(db, 'auditLogs'), {
          adminId: auth.currentUser.uid,
          adminEmail: auth.currentUser.email,
          action: 'rule.create',
          targetType: 'rule',
          targetId: docRef.id,
          changes: {
            after: ruleData,
            description: `建立點數規則「${ruleData.name}」`,
          },
          createdAt: Timestamp.now(),
        });

        message.success('點數規則已建立');
      }

      setModalVisible(false);
      fetchRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      message.error('儲存失敗');
    }
  };

  // 切換啟用狀態
  const handleToggleActive = async (rule) => {
    try {
      const newStatus = !rule.isActive;
      await updateDoc(doc(db, 'pointsRules', rule.id), {
        isActive: newStatus,
        updatedAt: Timestamp.now(),
      });

      // 記錄操作日誌
      await addDoc(collection(db, 'auditLogs'), {
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email,
        action: 'rule.toggle',
        targetType: 'rule',
        targetId: rule.id,
        changes: {
          before: { isActive: rule.isActive },
          after: { isActive: newStatus },
          description: `${newStatus ? '啟用' : '停用'}點數規則「${rule.name}」`,
        },
        createdAt: Timestamp.now(),
      });

      message.success(`已${newStatus ? '啟用' : '停用'}點數規則`);
      fetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      message.error('操作失敗');
    }
  };

  // 表格欄位
  const columns = [
    {
      title: '規則名稱',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <Space>
          <span className="text-xl">{record.icon}</span>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-400">{record.actionId}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => {
        const cat = CATEGORY_OPTIONS.find(c => c.value === category);
        return <Tag color={cat?.color || 'default'}>{cat?.label || category}</Tag>;
      },
    },
    {
      title: '基礎點數',
      dataIndex: 'basePoints',
      key: 'basePoints',
      width: 100,
      render: (points) => (
        <span className="font-bold text-amber-600">+{points}</span>
      ),
    },
    {
      title: '限制',
      key: 'limits',
      width: 150,
      render: (_, record) => {
        const limits = record.limits || {};
        const limitTags = [];
        if (limits.dailyMax) limitTags.push(`每日 ${limits.dailyMax} 次`);
        if (limits.weeklyMax) limitTags.push(`每週 ${limits.weeklyMax} 次`);
        if (limits.monthlyMax) limitTags.push(`每月 ${limits.monthlyMax} 次`);
        if (limits.totalMax) limitTags.push(`總計 ${limits.totalMax} 次`);
        if (limits.cooldownMinutes) limitTags.push(`冷卻 ${limits.cooldownMinutes} 分`);
        
        return limitTags.length > 0 ? (
          <Space direction="vertical" size={2}>
            {limitTags.map((tag, i) => (
              <Tag key={i} color="default" className="text-xs">{tag}</Tag>
            ))}
          </Space>
        ) : (
          <Tag color="green">無限制</Tag>
        );
      },
    },
    {
      title: '觸發方式',
      dataIndex: 'triggerType',
      key: 'triggerType',
      width: 100,
      render: (type) => {
        const trigger = TRIGGER_OPTIONS.find(t => t.value === type);
        const colorMap = { auto: 'blue', manual: 'orange', api: 'purple' };
        return <Tag color={colorMap[type]}>{trigger?.label || type}</Tag>;
      },
    },
    {
      title: '狀態',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="啟用"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="編輯">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GiftOutlined className="text-amber-500" />
            點數規則
          </h1>
          <p className="text-gray-500 mt-1">管理 UA 點數獲取規則與限制</p>
        </div>
        <Space>
          <Button
            icon={<GiftOutlined />}
            onClick={handleUpdateReferralRules}
            loading={updatingReferral}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: 'white' }}
          >
            更新推薦獎勵
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchRules}>
            重新載入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增規則
          </Button>
        </Space>
      </div>

      {/* 統計卡片 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="規則總數"
              value={stats.total}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="啟用中"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="累計發放點數"
              value={stats.totalPointsIssued}
              valueStyle={{ color: '#faad14' }}
              suffix="UA"
            />
          </Card>
        </Col>
      </Row>

      {/* 規則列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={false}
        />
      </Card>

      {/* 新增/編輯 Modal */}
      <Modal
        title={editingRule ? '編輯點數規則' : '新增點數規則'}
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
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="規則名稱"
                rules={[{ required: true, message: '請輸入名稱' }]}
              >
                <Input placeholder="如：每日登入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="icon"
                label="圖示"
                rules={[{ required: true, message: '請選擇圖示' }]}
              >
                <Select placeholder="選擇">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Option key={emoji} value={emoji}>
                      <span className="text-xl">{emoji}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actionId"
                label="行為代碼"
                rules={[
                  { required: true, message: '請輸入代碼' },
                  { pattern: /^[a-z_]+$/, message: '只能使用小寫字母和底線' },
                ]}
              >
                <Input placeholder="如：daily_login" disabled={!!editingRule} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="分類"
                rules={[{ required: true, message: '請選擇分類' }]}
              >
                <Select placeholder="選擇分類">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      <Tag color={cat.color}>{cat.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="說明"
          >
            <TextArea rows={2} placeholder="規則說明文字" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="basePoints"
                label="基礎點數"
                rules={[{ required: true, message: '請輸入點數' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="triggerType"
                label="觸發方式"
                rules={[{ required: true, message: '請選擇觸發方式' }]}
              >
                <Select placeholder="選擇">
                  {TRIGGER_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="排序"
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>限制條件</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['limits', 'dailyMax']}
                label="每日上限"
                tooltip="每日最多觸發次數"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="無限制" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['limits', 'weeklyMax']}
                label="每週上限"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="無限制" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['limits', 'monthlyMax']}
                label="每月上限"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="無限制" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['limits', 'totalMax']}
                label="總計上限"
                tooltip="此規則最多可觸發的總次數"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="無限制" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['limits', 'cooldownMinutes']}
                label="冷卻時間（分鐘）"
                tooltip="兩次觸發之間的最短間隔"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="無冷卻" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="啟用" unCheckedChildren="停用" /> 啟用此規則
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingRule ? '儲存變更' : '建立規則'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PointsRules;

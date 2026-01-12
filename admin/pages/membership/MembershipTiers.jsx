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
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Statistic,
  Badge,
  ColorPicker,
  Checkbox,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

// 權限選項
const PERMISSION_OPTIONS = [
  { key: 'canUseTools', label: '使用工具', description: '可使用平台工具' },
  { key: 'canExport', label: '匯出報表', description: '可匯出 PDF 報表' },
  { key: 'canAccessAI', label: 'AI 功能', description: '可使用 AI 智能分析' },
  { key: 'canEarnPoints', label: '獲得點數', description: '可透過行為獲得 UA 點' },
  { key: 'canRedeemPoints', label: '兌換點數', description: '可兌換商品' },
  { key: 'canAccessVIP', label: 'VIP 社群', description: '可進入 VIP 專屬社群' },
  { key: 'canCustomReferral', label: '自訂推薦碼', description: '可自訂推薦碼' },
];

// Emoji 選項
const EMOJI_OPTIONS = ['🏆', '💎', '🆓', '⏰', '❌', '🌟', '👑', '🎖️', '🔥', '💫', '⚡', '🎯'];

const MembershipTiers = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    usersPerTier: {},
  });

  // 載入身分組資料
  useEffect(() => {
    fetchTiers();
  }, []);

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
        tiersList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setTiers(tiersList);

      // 計算統計
      const activeCount = tiersList.filter(t => t.isActive).length;
      
      // 取得每個身分組的用戶數
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersPerTier = {};
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const tierId = userData.primaryTierId || 'trial';
        usersPerTier[tierId] = (usersPerTier[tierId] || 0) + 1;
      });

      setStats({
        total: tiersList.length,
        active: activeCount,
        usersPerTier,
      });

      message.success('身分組資料載入成功');
    } catch (error) {
      console.error('Error fetching tiers:', error);
      message.error('載入身分組資料失敗');
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
        benefits: tier.benefits?.join('\n') || '',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        priority: tiers.length + 1,
        pointsMultiplier: 1.0,
        isPermanent: false,
        isDefault: false,
        isActive: true,
        canBeAssignedManually: true,
        canBeEarnedByReferral: false,
        permissions: {
          canUseTools: true,
          canExport: false,
          canAccessAI: false,
          maxClients: 3,
          canEarnPoints: true,
          canRedeemPoints: false,
          canAccessVIP: false,
          canCustomReferral: false,
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
        benefits: values.benefits?.split('\n').filter(b => b.trim()) || [],
        updatedAt: Timestamp.now(),
      };

      if (editingTier) {
        // 更新
        await updateDoc(doc(db, 'membershipTiers', editingTier.id), tierData);
        
        // 記錄操作日誌
        await addDoc(collection(db, 'auditLogs'), {
          adminId: auth.currentUser.uid,
          adminEmail: auth.currentUser.email,
          action: 'tier.update',
          targetType: 'tier',
          targetId: editingTier.id,
          changes: {
            before: editingTier,
            after: tierData,
            description: `更新身分組「${tierData.name}」`,
          },
          createdAt: Timestamp.now(),
        });

        message.success('身分組已更新');
      } else {
        // 新增
        tierData.createdAt = Timestamp.now();
        tierData.createdBy = auth.currentUser.uid;
        
        const docRef = await addDoc(collection(db, 'membershipTiers'), tierData);
        
        // 記錄操作日誌
        await addDoc(collection(db, 'auditLogs'), {
          adminId: auth.currentUser.uid,
          adminEmail: auth.currentUser.email,
          action: 'tier.create',
          targetType: 'tier',
          targetId: docRef.id,
          changes: {
            after: tierData,
            description: `建立身分組「${tierData.name}」`,
          },
          createdAt: Timestamp.now(),
        });

        message.success('身分組已建立');
      }

      setModalVisible(false);
      fetchTiers();
    } catch (error) {
      console.error('Error saving tier:', error);
      message.error('儲存失敗');
    }
  };

  // 刪除身分組
  const handleDelete = async (tier) => {
    try {
      // 檢查是否有用戶使用此身分組
      const usersQuery = query(
        collection(db, 'users'),
        where('primaryTierId', '==', tier.slug)
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        message.error(`無法刪除：有 ${usersSnapshot.size} 位用戶正在使用此身分組`);
        return;
      }

      await deleteDoc(doc(db, 'membershipTiers', tier.id));

      // 記錄操作日誌
      await addDoc(collection(db, 'auditLogs'), {
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email,
        action: 'tier.delete',
        targetType: 'tier',
        targetId: tier.id,
        changes: {
          before: tier,
          description: `刪除身分組「${tier.name}」`,
        },
        createdAt: Timestamp.now(),
      });

      message.success('身分組已刪除');
      fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      message.error('刪除失敗');
    }
  };

  // 切換啟用狀態
  const handleToggleActive = async (tier) => {
    try {
      const newStatus = !tier.isActive;
      await updateDoc(doc(db, 'membershipTiers', tier.id), {
        isActive: newStatus,
        updatedAt: Timestamp.now(),
      });

      // 記錄操作日誌
      await addDoc(collection(db, 'auditLogs'), {
        adminId: auth.currentUser.uid,
        adminEmail: auth.currentUser.email,
        action: 'tier.toggle',
        targetType: 'tier',
        targetId: tier.id,
        changes: {
          before: { isActive: tier.isActive },
          after: { isActive: newStatus },
          description: `${newStatus ? '啟用' : '停用'}身分組「${tier.name}」`,
        },
        createdAt: Timestamp.now(),
      });

      message.success(`已${newStatus ? '啟用' : '停用'}身分組`);
      fetchTiers();
    } catch (error) {
      console.error('Error toggling tier:', error);
      message.error('操作失敗');
    }
  };

  // 調整優先級
  const handleMovePriority = async (tier, direction) => {
    try {
      const currentIndex = tiers.findIndex(t => t.id === tier.id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= tiers.length) return;

      const batch = writeBatch(db);
      
      // 交換優先級
      batch.update(doc(db, 'membershipTiers', tiers[currentIndex].id), {
        priority: tiers[targetIndex].priority,
      });
      batch.update(doc(db, 'membershipTiers', tiers[targetIndex].id), {
        priority: tiers[currentIndex].priority,
      });

      await batch.commit();
      message.success('排序已更新');
      fetchTiers();
    } catch (error) {
      console.error('Error moving priority:', error);
      message.error('調整排序失敗');
    }
  };

  // 表格欄位
  const columns = [
    {
      title: '排序',
      width: 80,
      render: (_, record, index) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            onClick={() => handleMovePriority(record, 'up')}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={index === tiers.length - 1}
            onClick={() => handleMovePriority(record, 'down')}
          />
        </Space>
      ),
    },
    {
      title: '身分組',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <Space>
          <span 
            className="text-2xl"
            style={{ 
              display: 'inline-block',
              width: 32,
              textAlign: 'center',
            }}
          >
            {record.icon}
          </span>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-400">{record.slug}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '顏色',
      dataIndex: 'color',
      key: 'color',
      width: 80,
      render: (color) => (
        <div
          className="w-8 h-8 rounded-lg border"
          style={{ backgroundColor: color }}
        />
      ),
    },
    {
      title: '用戶數',
      key: 'userCount',
      width: 100,
      render: (_, record) => (
        <Tag color="blue">
          {stats.usersPerTier[record.slug] || 0} 人
        </Tag>
      ),
    },
    {
      title: '點數倍率',
      dataIndex: 'pointsMultiplier',
      key: 'pointsMultiplier',
      width: 100,
      render: (multiplier) => (
        <Tag color={multiplier > 1 ? 'gold' : 'default'}>
          {multiplier}x
        </Tag>
      ),
    },
    {
      title: '有效期',
      key: 'duration',
      width: 100,
      render: (_, record) => (
        record.isPermanent ? (
          <Tag color="purple">永久</Tag>
        ) : (
          <Tag>{record.defaultDurationDays || '-'} 天</Tag>
        )
      ),
    },
    {
      title: '權限',
      key: 'permissions',
      width: 200,
      render: (_, record) => (
        <Space wrap size={[4, 4]}>
          {record.permissions?.canUseTools && <Tag color="blue">工具</Tag>}
          {record.permissions?.canExport && <Tag color="green">匯出</Tag>}
          {record.permissions?.canAccessAI && <Tag color="purple">AI</Tag>}
          {record.permissions?.canEarnPoints && <Tag color="gold">賺點</Tag>}
          {record.permissions?.canRedeemPoints && <Tag color="orange">兌換</Tag>}
          {record.permissions?.canAccessVIP && <Tag color="magenta">VIP</Tag>}
        </Space>
      ),
    },
    {
      title: '狀態',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Space>
          <Switch
            checked={record.isActive}
            onChange={() => handleToggleActive(record)}
            checkedChildren="啟用"
            unCheckedChildren="停用"
          />
          {record.isDefault && <Tag color="cyan">預設</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
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
            title="確定要刪除此身分組？"
            description="刪除後無法復原，請確認沒有用戶正在使用此身分組"
            onConfirm={() => handleDelete(record)}
            okText="確定刪除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="刪除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.isDefault}
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
            <CrownOutlined className="text-amber-500" />
            身分組管理
          </h1>
          <p className="text-gray-500 mt-1">管理會員身分組的權限與設定</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTiers}>
            重新載入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            新增身分組
          </Button>
        </Space>
      </div>

      {/* 統計卡片 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="身分組總數"
              value={stats.total}
              prefix={<CrownOutlined />}
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
              title="停用中"
              value={stats.total - stats.active}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 身分組列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={tiers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={false}
        />
      </Card>

      {/* 新增/編輯 Modal */}
      <Modal
        title={editingTier ? '編輯身分組' : '新增身分組'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="名稱"
                rules={[{ required: true, message: '請輸入名稱' }]}
              >
                <Input placeholder="如：🏆 創始會員" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="slug"
                label="代碼"
                rules={[
                  { required: true, message: '請輸入代碼' },
                  { pattern: /^[a-z_]+$/, message: '只能使用小寫字母和底線' },
                ]}
              >
                <Input placeholder="如：founder" disabled={!!editingTier} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="icon"
                label="圖示"
                rules={[{ required: true, message: '請選擇圖示' }]}
              >
                <Select placeholder="選擇 Emoji">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Option key={emoji} value={emoji}>
                      <span className="text-xl">{emoji}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="color"
                label="顏色"
                rules={[{ required: true, message: '請選擇顏色' }]}
              >
                <Input type="color" style={{ width: '100%', height: 32 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="優先級"
                rules={[{ required: true, message: '請輸入優先級' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="說明"
          >
            <Input placeholder="身分組說明文字" />
          </Form.Item>

          <Divider>權限設定</Divider>

          <Row gutter={[16, 16]}>
            {PERMISSION_OPTIONS.map((perm) => (
              <Col span={8} key={perm.key}>
                <Form.Item
                  name={['permissions', perm.key]}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    <span>{perm.label}</span>
                    <Tooltip title={perm.description}>
                      <InfoCircleOutlined className="ml-1 text-gray-400" />
                    </Tooltip>
                  </Checkbox>
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Row gutter={16} className="mt-4">
            <Col span={12}>
              <Form.Item
                name={['permissions', 'maxClients']}
                label="最大客戶數"
                tooltip="-1 表示無限制"
              >
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pointsMultiplier"
                label="點數倍率"
                rules={[{ required: true, message: '請輸入點數倍率' }]}
              >
                <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>有效期設定</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isPermanent"
                valuePropName="checked"
              >
                <Checkbox>永久有效</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="defaultDurationDays"
                label="預設有效天數"
                tooltip="非永久身分組的預設有效期"
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isDefault"
                valuePropName="checked"
              >
                <Checkbox>設為預設身分組</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Divider>其他設定</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isActive"
                valuePropName="checked"
              >
                <Checkbox>啟用</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="canBeAssignedManually"
                valuePropName="checked"
              >
                <Checkbox>可手動指派</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="canBeEarnedByReferral"
                valuePropName="checked"
              >
                <Checkbox>可透過推薦獲得</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="benefits"
            label="權益說明（每行一項）"
          >
            <TextArea rows={4} placeholder="永久享有早鳥價格鎖定&#10;優先體驗所有新功能&#10;專屬 VIP 社群" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingTier ? '儲存變更' : '建立身分組'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MembershipTiers;

/**
 * Ultra Advisor Admin - 任務管理頁面
 * 管理任務看板的任務設定
 *
 * 檔案位置：admin/src/pages/membership/Missions.jsx
 */

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
  Progress,
  List,
  Avatar,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  collectionGroup,
  where,
} from 'firebase/firestore';
import { db, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// 分類選項
const CATEGORY_OPTIONS = [
  { value: 'onboarding', label: '新手任務', color: 'green' },
  { value: 'social', label: '社交任務', color: 'blue' },
  { value: 'habit', label: '習慣任務', color: 'purple' },
  { value: 'daily', label: '每日任務', color: 'orange' },
];

// 連結類型
const LINK_TYPE_OPTIONS = [
  { value: 'modal', label: 'Modal（開啟彈窗）' },
  { value: 'internal', label: 'Internal（站內跳轉）' },
  { value: 'external', label: 'External（外部連結）' },
  { value: 'pwa', label: 'PWA（安裝教學）' },
];

// 驗證方式
const VERIFICATION_OPTIONS = [
  { value: 'auto', label: '自動驗證' },
  { value: 'manual', label: '手動確認' },
];

// 重複類型
const REPEAT_OPTIONS = [
  { value: 'once', label: '一次性' },
  { value: 'daily', label: '每日重置' },
];

// Emoji 選項
const EMOJI_OPTIONS = ['📸', '📝', '👤', '💬', '👥', '📱', '📋', '📅', '🎯', '🏆', '⭐', '🔥', '💡', '🎁'];

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [missionStats, setMissionStats] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalUsers: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [initializing, setInitializing] = useState(false);

  // 初始化預設任務
  const handleInitMissions = async () => {
    setInitializing(true);
    try {
      const initMissionsFunc = httpsCallable(functions, 'initMissions');
      const result = await initMissionsFunc();
      if (result.data.success) {
        message.success(result.data.message);
        fetchMissions();
      }
    } catch (error) {
      console.error('Init missions error:', error);
      message.error(error.message || '初始化失敗');
    } finally {
      setInitializing(false);
    }
  };

  // 載入任務
  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'missions'), orderBy('category'), orderBy('order'));
      const snapshot = await getDocs(q);

      const missionList = [];
      snapshot.forEach((doc) => {
        missionList.push({ id: doc.id, ...doc.data() });
      });

      setMissions(missionList);

      // 計算統計
      const activeCount = missionList.filter((m) => m.isActive).length;

      // 取得用戶總數
      const usersSnapshot = await getDocs(collection(db, 'users'));

      setStats({
        total: missionList.length,
        active: activeCount,
        totalUsers: usersSnapshot.size,
      });
    } catch (error) {
      console.error('Fetch missions error:', error);
      message.error('載入任務失敗');
    } finally {
      setLoading(false);
    }
  };

  // 開啟新增/編輯 Modal
  const openModal = (mission = null) => {
    setEditingMission(mission);
    if (mission) {
      form.setFieldsValue({
        ...mission,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        category: 'onboarding',
        order: missions.length + 1,
        points: 20,
        linkType: 'modal',
        verificationType: 'auto',
        repeatType: 'once',
      });
    }
    setModalVisible(true);
  };

  // 儲存任務
  const handleSave = async (values) => {
    try {
      const now = Timestamp.now();
      const missionData = {
        ...values,
        updatedAt: now,
      };

      if (editingMission) {
        // 更新
        await updateDoc(doc(db, 'missions', editingMission.id), missionData);
        message.success('任務已更新');
      } else {
        // 新增
        const newId = values.id || `mission_${Date.now()}`;
        await setDoc(doc(db, 'missions', newId), {
          ...missionData,
          createdAt: now,
        });
        message.success('任務已新增');
      }

      setModalVisible(false);
      fetchMissions();
    } catch (error) {
      console.error('Save mission error:', error);
      message.error('儲存失敗');
    }
  };

  // 切換任務啟用狀態
  const toggleActive = async (mission) => {
    try {
      await updateDoc(doc(db, 'missions', mission.id), {
        isActive: !mission.isActive,
        updatedAt: Timestamp.now(),
      });
      message.success(`任務已${mission.isActive ? '停用' : '啟用'}`);
      fetchMissions();
    } catch (error) {
      console.error('Toggle active error:', error);
      message.error('操作失敗');
    }
  };

  // 查看任務統計
  const viewStats = async (mission) => {
    setSelectedMission(mission);
    setMissionStats(null);
    setStatsModalVisible(true);

    try {
      // 查詢完成此任務的用戶
      const completedQuery = query(
        collectionGroup(db, 'completedMissions'),
        where('missionId', '==', mission.id)
      );
      const completedSnapshot = await getDocs(completedQuery);

      const completedUsers = [];
      completedSnapshot.forEach((doc) => {
        const data = doc.data();
        const userId = doc.ref.parent.parent.id;
        completedUsers.push({
          id: doc.id,
          userId,
          ...data,
        });
      });

      // 取得用戶詳細資料
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersMap = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });

      // 合併用戶資料
      const enrichedUsers = completedUsers.map((cu) => ({
        ...cu,
        user: usersMap[cu.userId] || {},
      }));

      // 排序（最新完成在前）
      enrichedUsers.sort((a, b) => {
        const aTime = a.completedAt?.toDate?.() || new Date(0);
        const bTime = b.completedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });

      setMissionStats({
        completedCount: completedUsers.length,
        totalUsers: usersSnapshot.size,
        completedUsers: enrichedUsers,
      });
    } catch (error) {
      console.error('Fetch mission stats error:', error);
      message.error('載入統計失敗');
    }
  };

  // 取得分類顏色
  const getCategoryColor = (category) => {
    const cat = CATEGORY_OPTIONS.find((c) => c.value === category);
    return cat?.color || 'default';
  };

  // 取得分類名稱
  const getCategoryLabel = (category) => {
    const cat = CATEGORY_OPTIONS.find((c) => c.value === category);
    return cat?.label || category;
  };

  // 過濾任務
  const filteredMissions =
    categoryFilter === 'all' ? missions : missions.filter((m) => m.category === categoryFilter);

  // 表格欄位
  const columns = [
    {
      title: '#',
      dataIndex: 'order',
      key: 'order',
      width: 50,
      render: (order) => <Text type="secondary">{order}</Text>,
    },
    {
      title: '圖示',
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon) => <span style={{ fontSize: 24 }}>{icon}</span>,
    },
    {
      title: '任務名稱',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => <Tag color={getCategoryColor(category)}>{getCategoryLabel(category)}</Tag>,
    },
    {
      title: '點數',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (points) => (
        <Text strong style={{ color: '#8b5cf6' }}>
          +{points} UA
        </Text>
      ),
    },
    {
      title: '類型',
      dataIndex: 'repeatType',
      key: 'repeatType',
      width: 80,
      render: (type) => (
        <Tag color={type === 'daily' ? 'orange' : 'default'}>{type === 'daily' ? '每日' : '一次性'}</Tag>
      ),
    },
    {
      title: '驗證',
      dataIndex: 'verificationType',
      key: 'verificationType',
      width: 80,
      render: (type) => <Tag color={type === 'auto' ? 'blue' : 'gold'}>{type === 'auto' ? '自動' : '手動'}</Tag>,
    },
    {
      title: '狀態',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            啟用
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            停用
          </Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="編輯">
            <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>
              編輯
            </Button>
          </Tooltip>
          <Tooltip title="統計">
            <Button size="small" icon={<BarChartOutlined />} onClick={() => viewStats(record)}>
              統計
            </Button>
          </Tooltip>
          <Tooltip title={record.isActive ? '停用' : '啟用'}>
            <Button
              size="small"
              type={record.isActive ? 'default' : 'primary'}
              onClick={() => toggleActive(record)}
            >
              {record.isActive ? '停用' : '啟用'}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* 統計卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="任務總數"
              value={stats.total}
              prefix={<TrophyOutlined style={{ color: '#8b5cf6' }} />}
              suffix="個"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="啟用中"
              value={stats.active}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              suffix="個"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="用戶總數"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#3b82f6' }} />}
              suffix="人"
            />
          </Card>
        </Col>
      </Row>

      {/* 主表格 */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TrophyOutlined className="text-purple-500" />
                任務管理
              </h1>
              <p className="text-gray-500 mt-1">管理任務看板的任務設定</p>
            </div>
          </div>
        }
        extra={
          <Space>
            {/* 分類篩選 */}
            <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 120 }}>
              <Option value="all">全部分類</Option>
              {CATEGORY_OPTIONS.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
            {missions.length === 0 && (
              <Button
                onClick={handleInitMissions}
                loading={initializing}
                style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: 'white' }}
              >
                初始化預設任務
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={fetchMissions}>
              重新載入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增任務
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredMissions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      {/* 新增/編輯 Modal */}
      <Modal
        title={editingMission ? '編輯任務' : '新增任務'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} className="mt-4">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="任務名稱"
                rules={[{ required: true, message: '請輸入任務名稱' }]}
              >
                <Input placeholder="例：設定個人頭像" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="icon" label="圖示" rules={[{ required: true, message: '請選擇圖示' }]}>
                <Select placeholder="選擇">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Option key={emoji} value={emoji}>
                      {emoji}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="任務說明（選填）">
            <TextArea rows={2} placeholder="簡短說明任務內容" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="category"
                label="分類"
                rules={[{ required: true, message: '請選擇分類' }]}
              >
                <Select>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="points"
                label="獎勵點數"
                rules={[{ required: true, message: '請輸入點數' }]}
              >
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="order" label="排序" rules={[{ required: true, message: '請輸入排序' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>連結設定</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="linkType" label="連結類型">
                <Select allowClear placeholder="選擇連結類型">
                  {LINK_TYPE_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="linkTarget" label="連結目標">
                <Input placeholder="Modal 名稱 / 路由 / URL" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>驗證設定</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="verificationType"
                label="驗證方式"
                rules={[{ required: true, message: '請選擇驗證方式' }]}
              >
                <Select>
                  {VERIFICATION_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="verificationField" label="驗證欄位">
                <Input placeholder="如：photoURL" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="verificationCondition" label="驗證條件">
                <Input placeholder="如：count>=3" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="repeatType"
                label="重複類型"
                rules={[{ required: true, message: '請選擇重複類型' }]}
              >
                <Select>
                  {REPEAT_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="啟用狀態" valuePropName="checked">
                <Switch checkedChildren="啟用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 mt-4">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                儲存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 統計 Modal */}
      <Modal
        title={
          <Space>
            <BarChartOutlined style={{ color: '#8b5cf6' }} />
            <span>「{selectedMission?.title}」完成統計</span>
          </Space>
        }
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={null}
        width={600}
      >
        {missionStats ? (
          <div>
            {/* 完成率 */}
            <div className="mb-6">
              <Text type="secondary">完成率</Text>
              <Progress
                percent={Math.round((missionStats.completedCount / missionStats.totalUsers) * 100) || 0}
                status="active"
                strokeColor="#8b5cf6"
              />
              <Text type="secondary">
                {missionStats.completedCount} / {missionStats.totalUsers} 人
              </Text>
            </div>

            <Divider />

            {/* 已完成用戶列表 */}
            <div>
              <Text strong>已完成用戶 ({missionStats.completedCount})</Text>
              <List
                className="mt-2"
                dataSource={missionStats.completedUsers.slice(0, 20)}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar src={item.user?.photoURL} icon={<UserOutlined />} />
                      }
                      title={item.user?.displayName || item.user?.email?.split('@')[0] || '未知用戶'}
                      description={
                        <Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.user?.email}
                          </Text>
                          <Tag color="green">+{item.pointsAwarded} UA</Tag>
                        </Space>
                      }
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.completedAt?.toDate?.().toLocaleString('zh-TW') || '-'}
                    </Text>
                  </List.Item>
                )}
                locale={{ emptyText: '尚無用戶完成此任務' }}
                style={{ maxHeight: 400, overflow: 'auto' }}
              />
              {missionStats.completedUsers.length > 20 && (
                <Text type="secondary" className="mt-2 block">
                  ...還有 {missionStats.completedUsers.length - 20} 位用戶
                </Text>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <Text type="secondary">載入中...</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Missions;

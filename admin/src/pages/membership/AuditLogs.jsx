import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Select,
  message,
  Row,
  Col,
  Statistic,
  DatePicker,
  Tooltip,
  Typography,
  Collapse,
} from 'antd';
import {
  ReloadOutlined,
  AuditOutlined,
  UserOutlined,
  CrownOutlined,
  GiftOutlined,
  ShoppingOutlined,
  SettingOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Panel } = Collapse;

// 操作類型定義
const ACTION_TYPES = {
  // 用戶相關
  'user.tier.update': { label: '更新身分組', color: 'blue', icon: <UserOutlined /> },
  'user.tier.add': { label: '新增身分組', color: 'green', icon: <UserOutlined /> },
  'user.tier.remove': { label: '移除身分組', color: 'orange', icon: <UserOutlined /> },
  'user.points.adjust': { label: '調整點數', color: 'gold', icon: <UserOutlined /> },
  'user.delete': { label: '刪除用戶', color: 'red', icon: <UserOutlined /> },
  'user.extend_trial': { label: '延長試用', color: 'cyan', icon: <UserOutlined /> },
  
  // 身分組相關
  'tier.create': { label: '建立身分組', color: 'green', icon: <CrownOutlined /> },
  'tier.update': { label: '更新身分組', color: 'blue', icon: <CrownOutlined /> },
  'tier.delete': { label: '刪除身分組', color: 'red', icon: <CrownOutlined /> },
  'tier.toggle': { label: '啟用/停用身分組', color: 'orange', icon: <CrownOutlined /> },
  
  // 點數規則相關
  'rule.create': { label: '建立點數規則', color: 'green', icon: <GiftOutlined /> },
  'rule.update': { label: '更新點數規則', color: 'blue', icon: <GiftOutlined /> },
  'rule.toggle': { label: '啟用/停用規則', color: 'orange', icon: <GiftOutlined /> },
  
  // 兌換商品相關
  'item.create': { label: '建立商品', color: 'green', icon: <ShoppingOutlined /> },
  'item.update': { label: '更新商品', color: 'blue', icon: <ShoppingOutlined /> },
  'item.toggle': { label: '上架/下架商品', color: 'orange', icon: <ShoppingOutlined /> },
  'item.delete': { label: '刪除商品', color: 'red', icon: <ShoppingOutlined /> },
  'item.stock.adjust': { label: '調整庫存', color: 'purple', icon: <ShoppingOutlined /> },
  
  // 兌換訂單相關
  'order.process': { label: '處理訂單', color: 'blue', icon: <ShoppingOutlined /> },
  'order.cancel': { label: '取消訂單', color: 'orange', icon: <ShoppingOutlined /> },
  'order.refund': { label: '退款訂單', color: 'red', icon: <ShoppingOutlined /> },
  
  // 系統設定
  'system.config.update': { label: '更新系統設定', color: 'purple', icon: <SettingOutlined /> },
};

// 目標類型
const TARGET_TYPES = [
  { value: 'user', label: '用戶', color: 'blue' },
  { value: 'tier', label: '身分組', color: 'gold' },
  { value: 'rule', label: '點數規則', color: 'green' },
  { value: 'item', label: '兌換商品', color: 'purple' },
  { value: 'order', label: '訂單', color: 'orange' },
  { value: 'system', label: '系統', color: 'default' },
];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    targetType: null,
    action: null,
    adminEmail: null,
    dateRange: null,
  });
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
  });

  // 載入操作日誌
  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let logsQuery = query(
        collection(db, 'auditLogs'),
        orderBy('createdAt', 'desc'),
        limit(200)
      );

      const snapshot = await getDocs(logsQuery);
      
      let logsList = [];
      const adminSet = new Set();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        logsList.push({
          id: doc.id,
          ...data,
        });
        if (data.adminEmail) {
          adminSet.add(data.adminEmail);
        }
      });

      // 套用篩選條件
      if (filters.targetType) {
        logsList = logsList.filter(l => l.targetType === filters.targetType);
      }
      if (filters.action) {
        logsList = logsList.filter(l => l.action === filters.action);
      }
      if (filters.adminEmail) {
        logsList = logsList.filter(l => l.adminEmail === filters.adminEmail);
      }
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const startDate = filters.dateRange[0].startOf('day').toDate();
        const endDate = filters.dateRange[1].endOf('day').toDate();
        logsList = logsList.filter(l => {
          const logDate = l.createdAt?.toDate();
          return logDate >= startDate && logDate <= endDate;
        });
      }

      setLogs(logsList);
      setAdmins(Array.from(adminSet));

      // 計算統計
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);

      const todayCount = logsList.filter(l => {
        const date = l.createdAt?.toDate();
        return date >= todayStart;
      }).length;

      const weekCount = logsList.filter(l => {
        const date = l.createdAt?.toDate();
        return date >= weekStart;
      }).length;

      setStats({
        total: logsList.length,
        today: todayCount,
        thisWeek: weekCount,
      });

      message.success('操作日誌載入成功');
    } catch (error) {
      console.error('Error fetching logs:', error);
      message.error('載入操作日誌失敗');
    } finally {
      setLoading(false);
    }
  };

  // 匯出 CSV
  const handleExport = () => {
    try {
      const csvContent = [
        ['時間', '管理員', '操作', '目標類型', '目標ID', '說明'].join(','),
        ...logs.map((log) => [
          log.createdAt ? dayjs(log.createdAt.toDate()).format('YYYY-MM-DD HH:mm:ss') : '',
          log.adminEmail,
          ACTION_TYPES[log.action]?.label || log.action,
          log.targetType,
          log.targetId || '',
          `"${log.changes?.description || ''}"`,
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `audit_logs_${dayjs().format('YYYY-MM-DD')}.csv`;
      link.click();

      message.success('匯出成功');
    } catch (error) {
      console.error('Export error:', error);
      message.error('匯出失敗');
    }
  };

  // 渲染變更詳情
  const renderChanges = (changes) => {
    if (!changes) return null;

    return (
      <Collapse ghost size="small">
        <Panel header="查看詳細變更" key="1">
          <div className="space-y-2 text-sm">
            <div className="text-gray-600">{changes.description}</div>
            {changes.before && (
              <div>
                <Text type="secondary">變更前：</Text>
                <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(changes.before, null, 2)}
                </pre>
              </div>
            )}
            {changes.after && (
              <div>
                <Text type="secondary">變更後：</Text>
                <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(changes.after, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Panel>
      </Collapse>
    );
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
      title: '管理員',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
      width: 200,
      ellipsis: true,
      render: (email) => (
        <Space>
          <UserOutlined className="text-blue-500" />
          {email}
        </Space>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => {
        const actionInfo = ACTION_TYPES[action] || { label: action, color: 'default' };
        return (
          <Tag color={actionInfo.color} icon={actionInfo.icon}>
            {actionInfo.label}
          </Tag>
        );
      },
    },
    {
      title: '目標類型',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 100,
      render: (type) => {
        const typeInfo = TARGET_TYPES.find(t => t.value === type);
        return <Tag color={typeInfo?.color}>{typeInfo?.label || type}</Tag>;
      },
    },
    {
      title: '目標 ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 150,
      ellipsis: true,
      render: (id) => (
        id ? (
          <Tooltip title={id}>
            <Text code className="text-xs">{id.substring(0, 12)}...</Text>
          </Tooltip>
        ) : '-'
      ),
    },
    {
      title: '說明',
      key: 'description',
      width: 300,
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.changes?.description || '-'}</div>
          {record.changes && (record.changes.before || record.changes.after) && (
            renderChanges(record.changes)
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AuditOutlined className="text-purple-500" />
            操作日誌
          </h1>
          <p className="text-gray-500 mt-1">追蹤所有管理員操作紀錄</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
            重新載入
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            匯出 CSV
          </Button>
        </Space>
      </div>

      {/* 統計卡片 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="總操作數"
              value={stats.total}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日操作"
              value={stats.today}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本週操作"
              value={stats.thisWeek}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 篩選器 */}
      <Card>
        <Space wrap size="middle">
          <Select
            placeholder="目標類型"
            style={{ width: 140 }}
            allowClear
            value={filters.targetType}
            onChange={(value) => setFilters(prev => ({ ...prev, targetType: value }))}
          >
            {TARGET_TYPES.map((type) => (
              <Option key={type.value} value={type.value}>
                <Tag color={type.color}>{type.label}</Tag>
              </Option>
            ))}
          </Select>

          <Select
            placeholder="操作類型"
            style={{ width: 180 }}
            allowClear
            value={filters.action}
            onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
          >
            {Object.entries(ACTION_TYPES).map(([key, info]) => (
              <Option key={key} value={key}>
                <Tag color={info.color}>{info.label}</Tag>
              </Option>
            ))}
          </Select>

          <Select
            placeholder="管理員"
            style={{ width: 200 }}
            allowClear
            showSearch
            value={filters.adminEmail}
            onChange={(value) => setFilters(prev => ({ ...prev, adminEmail: value }))}
          >
            {admins.map((email) => (
              <Option key={email} value={email}>
                {email}
              </Option>
            ))}
          </Select>

          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            placeholder={['開始日期', '結束日期']}
          />

          <Button 
            onClick={() => setFilters({ targetType: null, action: null, adminEmail: null, dateRange: null })}
          >
            清除篩選
          </Button>
        </Space>
      </Card>

      {/* 操作日誌列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 筆紀錄`,
          }}
        />
      </Card>
    </div>
  );
};

export default AuditLogs;

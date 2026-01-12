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
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const OperationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterModule, setFilterModule] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [searchOperator, setSearchOperator] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filterModule, dateRange]);

  // 獲取操作日誌
  const fetchLogs = async () => {
    setLoading(true);
    try {
      let logsQuery = query(
        collection(db, 'operationLogs'),
        orderBy('createdAt', 'desc'),
        limit(200)
      );

      const snapshot = await getDocs(logsQuery);
      let logsList = [];
      snapshot.forEach((doc) => {
        logsList.push({ key: doc.id, id: doc.id, ...doc.data() });
      });

      // 過濾模組
      if (filterModule !== 'all') {
        logsList = logsList.filter((l) => l.module === filterModule);
      }

      // 過濾操作者
      if (searchOperator) {
        logsList = logsList.filter((l) => 
          l.operatorEmail?.toLowerCase().includes(searchOperator.toLowerCase())
        );
      }

      // 過濾日期
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].startOf('day').toDate();
        const end = dateRange[1].endOf('day').toDate();
        logsList = logsList.filter((l) => {
          const date = l.createdAt?.toDate();
          return date >= start && date <= end;
        });
      }

      setLogs(logsList);
    } catch (error) {
      console.error('Error fetching logs:', error);
      // 如果還沒有日誌，不顯示錯誤
      if (error.code !== 'failed-precondition') {
        message.error('載入操作日誌失敗');
      }
    } finally {
      setLoading(false);
    }
  };

  // 查看詳情
  const viewDetail = (log) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  // 模組標籤
  const moduleLabels = {
    membershipTiers: { text: '身分組', color: 'gold' },
    pointsRules: { text: '點數規則', color: 'purple' },
    redeemableItems: { text: '兌換商品', color: 'pink' },
    pointsLedger: { text: '點數帳本', color: 'blue' },
    users: { text: '用戶', color: 'green' },
    redemptionOrders: { text: '兌換訂單', color: 'cyan' },
  };

  // 操作標籤顏色
  const getActionColor = (action) => {
    if (action?.includes('CREATE')) return 'green';
    if (action?.includes('UPDATE')) return 'blue';
    if (action?.includes('DELETE')) return 'red';
    if (action?.includes('TOGGLE')) return 'orange';
    if (action?.includes('ADJUST')) return 'purple';
    return 'default';
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
        return dayjs(timestamp.toDate()).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '操作者',
      dataIndex: 'operatorEmail',
      key: 'operatorEmail',
      width: 200,
      ellipsis: true,
    },
    {
      title: '模組',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module) => (
        <Tag color={moduleLabels[module]?.color || 'default'}>
          {moduleLabels[module]?.text || module}
        </Tag>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 130,
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action}
        </Tag>
      ),
    },
    {
      title: '目標',
      dataIndex: 'targetName',
      key: 'targetName',
      width: 150,
      ellipsis: true,
      render: (name, record) => name || record.targetId || '-',
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewDetail(record)}
          size="small"
        >
          詳情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📜 操作日誌</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
          重新載入
        </Button>
      </div>

      {/* 篩選工具列 */}
      <Card className="mb-4">
        <Space wrap>
          <Search
            placeholder="搜尋操作者 Email"
            allowClear
            enterButton="搜尋"
            style={{ width: 280 }}
            value={searchOperator}
            onChange={(e) => setSearchOperator(e.target.value)}
            onSearch={fetchLogs}
          />
          
          <Select
            value={filterModule}
            onChange={(v) => { setFilterModule(v); }}
            style={{ width: 140 }}
          >
            <Option value="all">全部模組</Option>
            <Option value="membershipTiers">身分組</Option>
            <Option value="pointsRules">點數規則</Option>
            <Option value="redeemableItems">兌換商品</Option>
            <Option value="pointsLedger">點數帳本</Option>
            <Option value="users">用戶</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={['開始日期', '結束日期']}
          />

          <Button onClick={() => {
            setSearchOperator('');
            setFilterModule('all');
            setDateRange(null);
            fetchLogs();
          }}>
            清除篩選
          </Button>
        </Space>
      </Card>

      {/* 日誌表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 詳情 Modal */}
      <Modal
        title="📋 操作日誌詳情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            關閉
          </Button>,
        ]}
        width={700}
      >
        {selectedLog && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="日誌 ID">
              <code className="text-xs">{selectedLog.id}</code>
            </Descriptions.Item>
            <Descriptions.Item label="時間">
              {selectedLog.createdAt 
                ? dayjs(selectedLog.createdAt.toDate()).format('YYYY-MM-DD HH:mm:ss')
                : '-'
              }
            </Descriptions.Item>
            <Descriptions.Item label="操作者">
              {selectedLog.operatorEmail}
            </Descriptions.Item>
            <Descriptions.Item label="操作者 ID">
              <code className="text-xs">{selectedLog.operatorId}</code>
            </Descriptions.Item>
            <Descriptions.Item label="模組">
              <Tag color={moduleLabels[selectedLog.module]?.color}>
                {moduleLabels[selectedLog.module]?.text || selectedLog.module}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="操作">
              <Tag color={getActionColor(selectedLog.action)}>
                {selectedLog.action}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="目標 ID">
              <code className="text-xs">{selectedLog.targetId}</code>
            </Descriptions.Item>
            <Descriptions.Item label="目標名稱">
              {selectedLog.targetName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="說明">
              {selectedLog.description}
            </Descriptions.Item>
            <Descriptions.Item label="變更前資料">
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(selectedLog.changes?.before, null, 2) || '(無)'}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="變更後資料">
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(selectedLog.changes?.after, null, 2) || '(無)'}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OperationLogs;

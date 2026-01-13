/**
 * Ultra Admin - 付款歷史頁面
 * 顯示所有付款記錄，支援篩選和匯出
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Button,
  Select,
  DatePicker,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 付款方案對照
const PAYMENT_PLANS = {
  30: { label: '月繳方案', price: 2999 },
  90: { label: '季繳方案', price: 7999 },
  180: { label: '半年方案', price: 14999 },
  365: { label: '年繳方案', price: 26999 },
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [filteredPayments, setFilteredPayments] = useState([]);

  // 統計數據
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    thisMonthRevenue: 0,
    thisMonthTransactions: 0,
  });

  // 載入付款記錄
  useEffect(() => {
    const q = query(
      collection(db, 'paymentHistory'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setPayments(data);
        setFilteredPayments(data);
        calculateStats(data);
        setLoading(false);
      },
      (error) => {
        console.error('載入付款記錄失敗:', error);
        message.error('載入付款記錄失敗');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 計算統計數據
  const calculateStats = (data) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let thisMonthTransactions = 0;

    data.forEach((payment) => {
      const amount = payment.amount || 0;
      totalRevenue += amount;

      if (payment.createdAt && payment.createdAt >= thisMonth) {
        thisMonthRevenue += amount;
        thisMonthTransactions++;
      }
    });

    setStats({
      totalRevenue,
      totalTransactions: data.length,
      thisMonthRevenue,
      thisMonthTransactions,
    });
  };

  // 篩選邏輯
  useEffect(() => {
    let filtered = [...payments];

    // 搜尋篩選（Email）
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.userEmail?.toLowerCase().includes(lowerSearch) ||
          p.userId?.toLowerCase().includes(lowerSearch) ||
          p.notes?.toLowerCase().includes(lowerSearch)
      );
    }

    // 日期範圍篩選
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter(
        (p) => p.createdAt && p.createdAt >= startDate && p.createdAt <= endDate
      );
    }

    setFilteredPayments(filtered);
  }, [searchText, dateRange, payments]);

  // 匯出 CSV
  const handleExport = () => {
    if (filteredPayments.length === 0) {
      message.warning('沒有資料可匯出');
      return;
    }

    const headers = ['日期時間', 'Email', '方案', '天數', '金額', '備註', '處理人'];
    const rows = filteredPayments.map((p) => [
      p.createdAt ? dayjs(p.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
      p.userEmail || '',
      PAYMENT_PLANS[p.days]?.label || `${p.days}天`,
      p.days || '',
      p.amount || 0,
      p.notes || '',
      p.processedByEmail || '',
    ]);

    const csvContent =
      '\uFEFF' + // BOM for UTF-8
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `付款記錄_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.click();

    message.success('匯出成功');
  };

  // 表格欄位
  const columns = [
    {
      title: '日期時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) =>
        date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
      sorter: (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0),
    },
    {
      title: '用戶',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 220,
      render: (email, record) => (
        <div>
          <div>{email || '-'}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.userId?.slice(0, 12)}...
          </Text>
        </div>
      ),
    },
    {
      title: '方案',
      dataIndex: 'days',
      key: 'days',
      width: 120,
      render: (days) => {
        const plan = PAYMENT_PLANS[days];
        return plan ? (
          <Tag color="blue">{plan.label}</Tag>
        ) : (
          <Tag>{days} 天</Tag>
        );
      },
      filters: [
        { text: '月繳方案 (30天)', value: 30 },
        { text: '季繳方案 (90天)', value: 90 },
        { text: '半年方案 (180天)', value: 180 },
        { text: '年繳方案 (365天)', value: 365 },
      ],
      onFilter: (value, record) => record.days === value,
    },
    {
      title: '金額',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${amount?.toLocaleString() || 0}
        </Text>
      ),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: '天數變化',
      key: 'daysChange',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <Text type="secondary">{record.previousDays || 0}</Text>
          <span style={{ margin: '0 4px' }}>→</span>
          <Text strong style={{ color: '#1890ff' }}>
            {record.newDaysRemaining || 0}
          </Text>
        </div>
      ),
    },
    {
      title: '備註',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      ellipsis: true,
      render: (notes) => (
        <Tooltip title={notes}>
          <Text type="secondary">{notes || '-'}</Text>
        </Tooltip>
      ),
    },
    {
      title: '處理人',
      dataIndex: 'processedByEmail',
      key: 'processedByEmail',
      width: 150,
      render: (email) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {email || '-'}
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* 標題 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          付款歷史
        </Title>
        <Text type="secondary">查看所有付款記錄和統計數據</Text>
      </div>

      {/* 統計卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="總收入"
              value={stats.totalRevenue}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="總筆數"
              value={stats.totalTransactions}
              suffix="筆"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="本月收入"
              value={stats.thisMonthRevenue}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="本月筆數"
              value={stats.thisMonthTransactions}
              suffix="筆"
            />
          </Card>
        </Col>
      </Row>

      {/* 篩選工具列 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="搜尋 Email 或備註..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['開始日期', '結束日期']}
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchText('');
                  setDateRange(null);
                }}
              >
                重置
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                匯出 CSV
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 資料表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 筆記錄`,
          }}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default PaymentHistory;

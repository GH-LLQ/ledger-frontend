import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Row, Col, Card, Statistic, Table, Button, Modal, Form, Input, DatePicker, Select, message, Popconfirm, Space, Avatar, Dropdown } from 'antd';
import { DeleteOutlined, EditOutlined, LogoutOutlined, PlusOutlined, PieChartOutlined, WalletOutlined, AppstoreOutlined, CreditCardOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { getTransactions, addTransaction, updateTransaction, getSummary, getCategoryStats, getCategories, getAccounts, deleteTransaction, getTrend } from '../api';

const { Header, Content } = Layout;
const { Option } = Select;



export default function Dashboard() {
  const navigate = useNavigate();
  // 假设通过接口获取用户名
  const username = localStorage.getItem('username') || 'User';
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [chartData, setChartData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null); // 👈 新增：当前正在编辑的记录
  const [trendData, setTrendData] = useState([]);

  // 新增：分类和账户的列表状态
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentType, setCurrentType] = useState('EXPENSE'); // 默认选中支出

  const [form] = Form.useForm();
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [sorter, setSorter] = useState({ field: 'transactionDate', order: 'descend' });

  // 加载核心数据
  const loadData = async () => {
    setLoading(true);
    try {
     //  计算当月的起止日期
      const startOfMonth = dayjs(currentMonth).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dayjs(currentMonth).endOf('month').format('YYYY-MM-DD');

      // 把 Antd 的 descend/ascend 翻译成后端认识的 desc/asc
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      //  请求列表（带上页码和日期)
      const txRes = await getTransactions({
          page: pagination.current - 1, // Spring Boot 从 0 开始
          size: pagination.pageSize,
          startDate: startOfMonth,
          endDate: endOfMonth,
          sortField: sorter?.field || 'transactionDate',      // 👈 传给后端，加兜底
          sortOrder: sorter?.order === 'ascend' ? 'asc' : 'desc'          // 👈 传给后端，加兜底
      });
      setTransactions(txRes.content);
      //  更新总条数（小心死循环）
      setPagination(prev => ({ ...prev, total: txRes.totalElements }));

      //  加载月度汇总（用 state 里的 currentMonth）
      const sumRes = await getSummary(currentMonth);
      setSummary(sumRes);

      //  加载分类饼图
      const chartRes = await getCategoryStats(currentMonth, 'EXPENSE');
      setChartData(chartRes);
      // 👇 新增：请求近 6 个月趋势
      const trendRes = await getTrend(6);
      setTrendData(trendRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    console.log('请求参数:', sorter, pagination);
  };

  useEffect(() => {
    loadData();
    // 账户列表只需要加载一次
    if (accounts.length === 0) {
        loadMeta('EXPENSE');
    }
  }, [currentMonth, pagination.current, pagination.pageSize, sorter.field, sorter.order]); // 👈 关键：监听 当前月份、页码和排序，变化时重新加载

  // 加载分类和账户
  const loadMeta = async (type) => {
    try {
      console.log('正在请求分类，类型:', type); // 加上日志，方便看控制台
      const catRes = await getCategories(type);
      console.log('后端返回的分类:', catRes);   // 看看返回的到底是什么
      setCategories(catRes);
      // 改成每次直接拉取，或者在这里判断。最简单就是直接拉，开销很小
      const accRes = await getAccounts();
      setAccounts(accRes);
    } catch (e) {
        console.error('加载分类/账户失败', e);
      }
  };



  // 监听表单里类型的切换
  const handleTypeChange = (type) => {
    console.log("切换类型触发，当前类型:", type); // 我们再加个 log 确保它被执行
    setCurrentType(type);
    form.setFieldsValue({ categoryId: undefined }); // 清空已选分类
    loadMeta(type); // 重新加载对应类型的分类
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // 提交新增和编辑记录
  const handleSave = async (values) => {
    try {
      const payload = {
          ...values,
          transactionDate: values.transactionDate.format('YYYY-MM-DD'),
          amount: Number(values.amount),
          };

      if (editingTx) {
          await updateTransaction(editingTx.id, payload);
          message.success('修改成功');
      } else {
          await addTransaction(payload);
          message.success('记账成功');
          }
      setIsModalOpen(false);

      loadData(); // 刷新数据
    } catch (e) {}
  };
// 打开新增弹窗
  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({
          type: 'EXPENSE',
          accountId: accounts[0]?.id,
          // 👇 新增：默认填入当前选中月份的第 1 天（或者今天）
          transactionDate: dayjs(currentMonth).startOf('month')
      });
      loadMeta('EXPENSE');
    }, 0);
  };

// 打开编辑弹窗
  const handleOpenEdit = (record) => {
    setEditingTx(record);
    setIsModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        transactionDate: dayjs(record.transactionDate) // 日期转成 dayjs 对象
      });
      loadMeta(record.type); // 加载对应类型的分类下拉
      setCurrentType(record.type);
    }, 0);
  };

  // 删除记录
  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      message.success('删除成功');
      loadData(); // 重新拉取列表和图表
    } catch (e) {
      // 错误提示已被 axios 拦截器统一处理
    }
  };

  // ECharts 饼图配置
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        data: chartData.map(item => ({ name: item.categoryName, value: item.totalAmount }))
      }
    ]
  };

  // ECharts 折线图配置
  const lineOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map(item => item.month)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        itemStyle: { color: '#52c41a' },
        data: trendData.map(item => item.income)
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        itemStyle: { color: '#ff4d4f' },
        data: trendData.map(item => item.expense)
      }
    ]
  };

  // 表格列定义
  const columns = [
    { title: '日期',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      sorter: true,                 // 👈 开启排序
      sortOrder: sorter.field === 'transactionDate' ? sorter.order : null // 👈 受控，显示箭头
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type === 'INCOME' ? <span style={{ color: 'green' }}>收入</span> : <span style={{ color: 'red' }}>支出</span>
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,                 // 👈 开启排序
      sortOrder: sorter.field === 'amount' ? sorter.order : null, // 👈 受控
      render: (amount, record) => (
        <span style={{ fontWeight: 'bold', color: record.type === 'INCOME' ? 'green' : 'red' }}>
          {record.type === 'INCOME' ? '+' : '-'} ¥{amount}
        </span>
      )
    },

    {
     title: '账户',
     dataIndex: 'accountId',
     key: 'accountId',
     render: (accountId) => {
     // 从我们加载好的 accounts 列表里找到对应名称
     const acc = accounts.find(a => a.id === accountId);
     return acc ? acc.name : '未知账户';
     }
    },

    { title: '备注', dataIndex: 'note', key: 'note' },
    // 👇 新增的操作列
    {
        title: '操作',
        key: 'action',
        render: (_, record) => (
            <Space>
                <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
               <Popconfirm title="确定要删除这条记录吗？" onConfirm={() => handleDelete(record.id)}>
                   <Button type="text" danger icon={<DeleteOutlined />} />
               </Popconfirm>
            </Space>
          ),
      },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px #f0f1f2' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold' }}><WalletOutlined /> 记账本</div>
        <Menu
        mode="horizontal"
        // Dashboard 里填 ['1']，Category 里填 ['2']，Account 里填 ['3']
        selectedKeys={['1']}
        style={{ flex: 1, minWidth: 0, justifyContent: 'center', borderBottom: 'none' }}
        onClick={({ key }) => {
            if (key === '1') navigate('/');
            if (key === '2') navigate('/category');
            if (key === '3') navigate('/account'); // 👈 加上跳转
         }}
        items={[
            { key: '1', icon: <PieChartOutlined />, label: '数据概览' },
            { key: '2', icon: <AppstoreOutlined />, label: '分类管理' },
            { key: '3', icon: <CreditCardOutlined />, label: '账户管理' }, // 👈 加上项
           ]}
        />
         <Dropdown
           menu={{
             items: [
               {
                 key: 'profile',
                 label: '个人信息',
                 onClick: () => {
                     console.log('点击了个人信息，准备跳转到 profile');
                     navigate('/profile'); // 👈 这个是去个人信息的
                 }
               },
               {
                   key: 'logout',
                   label: '退出登录',
                   onClick:() => handleLogout() // 👈 直接调用你定义的方法
               }
             ]
           }}
            trigger={['click']} // 👈 关键：改成点击触发
         >
           <Button type="text" style={{ display: 'flex', alignItems: 'center',  height: '100%' }}>
             <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff', marginRight: 8 }} />
             <span style={{ fontWeight: 'bold' }}>{username}</span>
           </Button>
         </Dropdown>
      </Header>

      <Content style={{ padding: '24px' }}>

       {/* 新增：月份选择器 */}
       <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
           <span style={{ fontSize: 16, fontWeight: 'bold' }}>数据统计月份：</span>
           <DatePicker
             picker="month"
             value={dayjs(currentMonth)}
             onChange={(date) => {
             if (date) setCurrentMonth(date.format('YYYY-MM'));
              }}
              allowClear={false}
             />
        </div>

        {/* 顶部统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card variant="borderless" style={{ background: '#f6ffed' }}>
              <Statistic title="本月收入" value={summary.totalIncome} precision={2} prefix="¥" styles={{ content: {color: '#3f8600'} }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="borderless" style={{ background: '#fff1f0' }}>
              <Statistic title="本月支出" value={summary.totalExpense} precision={2} prefix="¥" styles={{ content: { color: '#cf1322'} }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="borderless" style={{ background: '#e6f7ff' }}>
              <Statistic title="本月结余" value={summary.balance} precision={2} prefix="¥" styles={{ content: { color: '#1677ff'} }} />
            </Card>
          </Col>
        </Row>

        {/* 👇 新增：收支趋势折线图 */}
        <Card title="近 6 个月收支趋势" bordered={false} style={{ marginBottom: 24 }}>
          {trendData.length > 0 ? (
            <ReactECharts option={lineOption} style={{ height: 300 }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>暂无趋势数据</div>
          )}
        </Card>

        <Row gutter={16}>
          {/* 左侧：分类饼图 */}
          <Col span={8}>
            <Card title="支出分类统计" variant="borderless" style={{ height: '100%' }}>
              {chartData.length > 0 ? (
                <ReactECharts option={pieOption} style={{ height: 300 }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>本月暂无支出数据</div>
              )}
            </Card>
          </Col>

          {/* 右侧：记账列表 */}
          <Col span={16}>
            <Card
              title="收支明细"
              variant="borderless"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
                  记一笔
                </Button>
              }
            >
              <Table
                dataSource={transactions}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page, pageSize) => {
                    setPagination(prev => ({ ...prev, current: page, pageSize }));

                }
               }}
                onChange={(pag, filters, sorterInfo) => {
                  // Antd 的 sorterInfo.order 可能是 'ascend', 'descend', 或 undefined
                  setSorter({
                   field: sorterInfo.field || 'transactionDate',
                   order: sorterInfo.order
                  });
                  // 排序变化时，回到第一页
                  setPagination(prev => ({ ...prev, current: 1 }));
                }}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      {/* 记账弹窗 */}
      <Modal
        title="新增收支记录"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{ type: 'EXPENSE', accountId: 1 }}
        preserve={false}  // 👈 加上这一句，弹窗关闭自动清空
        >
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select onChange={handleTypeChange}>
              <Option value="EXPENSE">支出</Option>
              <Option value="INCOME">收入</Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <Input type="number" step="0.01" prefix="¥" />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请输入分类' }]}>
            <Select placeholder="请选择分类" key={currentType}>
                {categories.map(c => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                     ))}
                 </Select>
          </Form.Item>

           <Form.Item name="accountId" label="账户" rules={[{ required: true, message: '请选择账户' }]}>
               <Select placeholder="请选择账户">
                   {accounts.map(a => (
                       <Option key={a.id} value={a.id}>{a.name} (余额: ¥{a.balance})</Option>
                    ))}
                    </Select>
           </Form.Item>

          <Form.Item name="transactionDate" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker
            style={{ width: '100%' }}
             // 当没有具体日期时，默认展示当前选中的月份
             defaultValue={dayjs(currentMonth)}
             disabledDate={(current) => {
               // 禁用未来日期 (current 是当前遍历到的日期)
               return current && current > dayjs().endOf('day');
             }}
             />
          </Form.Item>

          <Form.Item name="note" label="备注">
            <Input.TextArea rows={2} placeholder="写点备注..." />
          </Form.Item>
          {/* 隐藏字段，我们暂时写死 accountId 为 1 */}
          <Form.Item name="accountId" hidden><Input /></Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import { Layout, Menu, Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, WalletOutlined, PieChartOutlined, AppstoreOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../api';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function Account() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAccounts();
      setData(res);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setTimeout(() => {
      if (item) {
        form.setFieldsValue(item);
      } else {
        form.resetFields();
        form.setFieldsValue({ type: 'CASH' }); // 默认现金
      }
    }, 0);
  };

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await updateAccount(editingItem.id, values);
        message.success('修改成功');
      } else {
        await createAccount({ ...values, balance: 0 }); // 新账户初始余额为 0
        message.success('新增成功');
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      message.success('删除成功');
      loadData();
    } catch (e) {}
  };

  const columns = [
    { title: '账户名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const map = { CASH: '现金', BANK: '银行卡', ALIPAY: '支付宝', WECHAT: '微信' };
        return map[type] || type;
      }
    },
    {
      title: '当前余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => <span style={{ fontWeight: 'bold', color: '#1677ff' }}>¥ {Number(balance).toFixed(2)}</span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm title="确定删除该账户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
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
          selectedKeys={['3']} // 账户管理菜单
          style={{ flex: 1, minWidth: 0, justifyContent: 'center', borderBottom: 'none' }}
          onClick={({ key }) => {
            if (key === '1') navigate('/');
            if (key === '2') navigate('/category');
          }}
          items={[
            { key: '1', icon: <PieChartOutlined />, label: '数据概览' },
            { key: '2', icon: <AppstoreOutlined />, label: '分类管理' },
            { key: '3', icon: <CreditCardOutlined />, label: '账户管理' },
          ]}
        />
        <Button type="text" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>退出</Button>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>账户管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增账户</Button>
        </div>

        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={false} />
      </Content>

      <Modal
        title={editingItem ? '编辑账户' : '新增账户'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} preserve={false}>
          <Form.Item name="name" label="账户名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：招行储蓄卡、微信零钱" />
          </Form.Item>

          <Form.Item name="type" label="账户类型" rules={[{ required: true }]}>
            <Select>
              <Option value="CASH">现金</Option>
              <Option value="BANK">银行卡</Option>
              <Option value="ALIPAY">支付宝</Option>
              <Option value="WECHAT">微信</Option>
            </Select>
          </Form.Item>

          {editingItem && (
            <div style={{ color: '#999', fontSize: 12, marginTop: -10 }}>
              * 余额由记账记录自动计算，不可手动修改
            </div>
          )}
        </Form>
      </Modal>
    </Layout>
  );
}
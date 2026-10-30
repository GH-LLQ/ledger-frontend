import { useState, useEffect } from 'react';
import { Layout, Menu, Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined, WalletOutlined, PieChartOutlined, AppstoreOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function Category() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('EXPENSE'); // 当前查看的类型
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getCategories(type);
      setData(res);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type]);

  // 打开弹窗（新增或编辑）
  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);

  // 使用 setTimeout 把赋值推迟到弹窗 DOM 渲染之后
  setTimeout(() => {
      if (item) {
          form.setFieldsValue(item);
           } else {
               form.resetFields();
               form.setFieldsValue({ type });
            }
        }, 0);
  };

  // 提交保存
  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await updateCategory(editingItem.id, values);
        message.success('修改成功');
      } else {
        await createCategory(values);
        message.success('新增成功');
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {}
  };

  // 删除
  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success('删除成功');
      loadData();
    } catch (e) {}
  };

  const columns = [
    { title: '分类名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (t) => t === 'INCOME' ? '收入' : '支出'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm title="确定删除该分类吗？" onConfirm={() => handleDelete(record.id)}>
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
          selectedKeys={['2']}
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
        <Button type="text" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>退出</Button>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>分类管理</Title>
          <Space>
            <Select value={type} onChange={setType} style={{ width: 120 }}>
              <Option value="EXPENSE">支出分类</Option>
              <Option value="INCOME">收入分类</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增分类</Button>
          </Space>
        </div>

        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={false} />
      </Content>

      <Modal
        title={editingItem ? '编辑分类' : '新增分类'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        destroyOnClose // 👈 加这一句
      >
        <Form form={form} layout="vertical" onFinish={handleSave} >
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：餐饮、交通、工资" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select disabled={!!editingItem}>
              <Option value="EXPENSE">支出</Option>
              <Option value="INCOME">收入</Option>
            </Select>
          </Form.Item>
          <Form.Item name="icon" label="图标（可选）">
            <Input placeholder="例如：food, car" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import { Layout, Menu, Card, Form, Input, Button, message, Typography } from 'antd';
import { WalletOutlined, PieChartOutlined, AppstoreOutlined, CreditCardOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile } from '../api';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Profile() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMe().then(res => {
      form.setFieldsValue({ email: res.email });
    });
  }, [form]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success('更新成功');
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0 20px' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold' }}><WalletOutlined /> 记账本</div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回主页</Button>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Card title="个人信息设置" style={{ maxWidth: 600, margin: '0 auto' }}>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item label="用户名">
              <Input value={localStorage.getItem('username')} disabled />
            </Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}>
              <Input placeholder="请输入你的邮箱" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>保存修改</Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Category from './pages/Category'; // 引入新页面
import Account from './pages/Account'; // 引入新页面
import Register from './pages/Register'; // 👈 引入注册页
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

// 简单的路由守卫
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};


function App() {
  return (
    <ConfigProvider locale={zhCN}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/category" element={<PrivateRoute><Category /></PrivateRoute>} />
              <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
  );
}

export default App;

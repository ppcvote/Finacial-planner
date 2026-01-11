import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ 檢查是否已登入，已登入就直接跳轉
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('已登入，導向 dashboard');
        navigate('/admin/dashboard', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 登入 Firebase
      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // ✅ 登入成功，顯示訊息（導向由 useEffect 處理）
      message.success('登入成功！');
      // 不需要手動 navigate，onAuthStateChanged 會處理
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        message.error('帳號或密碼錯誤');
      } else {
        message.error('登入失敗，請稍後再試');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Ultra Advisor
          </h1>
          <p className="text-gray-500">後台管理系統</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '請輸入 Email' },
              { type: 'email', message: '請輸入有效的 Email' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密碼"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="w-full"
            >
              登入
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-gray-500 text-sm mt-4">
          <p>© 2026 Ultra Advisor. All rights reserved.</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;

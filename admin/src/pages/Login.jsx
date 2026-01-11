import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. 登入 Firebase
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. 檢查是否為管理員
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (!adminDoc.exists()) {
        // 不是管理員，登出並拒絕
        await auth.signOut();
        message.error('此帳號沒有管理員權限');
        setLoading(false);
        return;
      }

      // 3. 是管理員，允許登入
      message.success('登入成功！');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        message.error('帳號或密碼錯誤');
      } else {
        message.error('登入失敗，請稍後再試');
      }
    } finally {
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

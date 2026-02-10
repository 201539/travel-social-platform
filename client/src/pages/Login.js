import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', values);
            setAuth(response.token, response.user);
            message.success('登录成功');
            navigate('/');
        } catch (error) {
            // axios 拦截器里已将错误包装成 { message, status }，这里优先展示 error.message
            message.error(error?.message || error.response?.data?.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Card className="auth-card" title="登录">
                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="邮箱"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            登录
                        </Button>
                    </Form.Item>

                    <div className="auth-footer">
                        还没有账号？<Link to="/register">立即注册</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;


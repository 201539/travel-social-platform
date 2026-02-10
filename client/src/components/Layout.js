import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button } from 'antd';
import { HomeOutlined, PlusOutlined, UserOutlined, LogoutOutlined, CloudOutlined } from '@ant-design/icons';
import { getAuth, clearAuth } from '../utils/auth';
import './Layout.css';

const { Header, Content, Footer } = AntLayout;

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = getAuth();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: '首页',
        },
        {
            key: '/weather-search',
            icon: <CloudOutlined />,
            label: '天气搜索',
        },
        {
            key: '/create-travel',
            icon: <PlusOutlined />,
            label: '创建游记',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人中心',
            onClick: () => navigate(`/profile/${user?.id}`),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

    return (
        <AntLayout className="app-layout">
            <Header className="app-header">
                <div className="header-content">
                    <div className="logo" onClick={() => navigate('/')}>
                        旅行社交平台
                    </div>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={({ key }) => navigate(key)}
                        style={{ flex: 1, minWidth: 0 }}
                    />
                    <div className="header-right">
                        {user ? (
                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                <Avatar src={user.avatar} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                            </Dropdown>
                        ) : (
                            <Button type="primary" onClick={() => navigate('/login')}>
                                登录
                            </Button>
                        )}
                    </div>
                </div>
            </Header>
            <Content className="app-content">
                <Outlet />
            </Content>
            <Footer className="app-footer">
                旅行社交平台 ©2024
            </Footer>
        </AntLayout>
    );
};

export default Layout;


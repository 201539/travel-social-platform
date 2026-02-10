import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Card, Avatar, Empty, Row, Col, Button, Tabs, Popconfirm, message, Tag, Space } from 'antd';
import { UserOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getAuth } from '../utils/auth';
import Loading from '../components/Loading';
import './Profile.css';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = getAuth();
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery(
        ['user', id],
        () => api.get(`/users/${id}`)
    );

    const { data: travels, isLoading: travelsLoading } = useQuery(
        ['travels', 'author', id],
        () => api.get('/travels', { params: { author: id } })
    );

    // 删除游记的mutation
    const deleteTravelMutation = useMutation(
        (travelId) => api.delete(`/travels/${travelId}`),
        {
            onSuccess: () => {
                message.success('删除成功');
                // 刷新游记列表和用户信息
                queryClient.invalidateQueries(['travels', 'author', id]);
                queryClient.invalidateQueries(['user', id]);
            },
            onError: (error) => {
                message.error(error.response?.data?.message || '删除失败');
            }
        }
    );

    const handleDelete = (travelId, e) => {
        e.stopPropagation(); // 阻止点击事件冒泡到Card
        deleteTravelMutation.mutate(travelId);
    };

    // 管理员：封禁/解封用户
    const banUserMutation = useMutation(
        () => api.post(`/users/${id}/ban`, { bannedReason: '管理员封禁' }),
        {
            onSuccess: () => {
                message.success('封禁成功');
                queryClient.invalidateQueries(['user', id]);
            },
            onError: (error) => {
                message.error(error.response?.data?.message || '封禁失败');
            }
        }
    );

    const unbanUserMutation = useMutation(
        () => api.post(`/users/${id}/unban`),
        {
            onSuccess: () => {
                message.success('解封成功');
                queryClient.invalidateQueries(['user', id]);
            },
            onError: (error) => {
                message.error(error.response?.data?.message || '解封失败');
            }
        }
    );

    if (isLoading) {
        return <Loading />;
    }

    if (!user) {
        return <Empty description="用户不存在" />;
    }

    const isOwnProfile = currentUser?.id === user._id;
    const isAdmin = currentUser?.role === 'admin';
    const canAdminManageUser = isAdmin && !isOwnProfile && user.role !== 'admin';
    const canDeleteTravel = isOwnProfile || isAdmin;

    return (
        <div className="profile-container">
            <Card className="profile-header">
                <div className="profile-info">
                    <Avatar size={80} src={user.avatar} icon={<UserOutlined />} />
                    <div className="profile-details">
                        <h2>
                            <Space size={8}>
                                <span>{user.username}</span>
                                {user.role === 'admin' && <Tag color="gold">管理员</Tag>}
                                {user.isBanned && <Tag color="red">已封禁</Tag>}
                            </Space>
                        </h2>
                        <p>{user.bio || '这个人很懒，什么都没有留下'}</p>
                        <div className="profile-stats">
                            <span>游记 {user.travelCount || 0}</span>
                            <span>关注 {user.following?.length || 0}</span>
                            <span>粉丝 {user.followers?.length || 0}</span>
                        </div>
                    </div>
                </div>
                <Space>
                    {isOwnProfile && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/create-travel')}
                        >
                            创建游记
                        </Button>
                    )}

                    {canAdminManageUser && (
                        user.isBanned ? (
                            <Popconfirm
                                title="确定要解封该用户吗？"
                                onConfirm={() => unbanUserMutation.mutate()}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button loading={unbanUserMutation.isLoading}>
                                    解封用户
                                </Button>
                            </Popconfirm>
                        ) : (
                            <Popconfirm
                                title="确定要封禁该用户吗？"
                                description="封禁后该用户将无法登录和访问需要登录的功能"
                                onConfirm={() => banUserMutation.mutate()}
                                okText="确定"
                                cancelText="取消"
                                okType="danger"
                            >
                                <Button danger loading={banUserMutation.isLoading}>
                                    封禁用户
                                </Button>
                            </Popconfirm>
                        )
                    )}
                </Space>
            </Card>

            <Card className="profile-content">
                <Tabs defaultActiveKey="travels">
                    <Tabs.TabPane tab="游记" key="travels">
                        {travelsLoading ? (
                            <Loading />
                        ) : travels?.travels?.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {travels.travels.map((travel) => (
                                    <Col xs={24} sm={12} lg={8} key={travel._id}>
                                        <Card
                                            hoverable
                                            cover={
                                                travel.photos?.length > 0 ? (
                                                    <img
                                                        alt={travel.title}
                                                        src={travel.photos[0]}
                                                        style={{ height: 200, objectFit: 'cover' }}
                                                    />
                                                ) : null
                                            }
                                            onClick={() => navigate(`/travel/${travel._id}`)}
                                            style={{ position: 'relative' }}
                                        >
                                            <Card.Meta title={travel.title} />
                                            {canDeleteTravel && (
                                                <Popconfirm
                                                    title="确定要删除这篇游记吗？"
                                                    description="删除后无法恢复"
                                                    onConfirm={(e) => handleDelete(travel._id, e)}
                                                    onCancel={(e) => e?.stopPropagation()}
                                                    okText="确定"
                                                    cancelText="取消"
                                                    okType="danger"
                                                >
                                                    <Button
                                                        type="primary"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        loading={deleteTravelMutation.isLoading}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            zIndex: 10,
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                        }}
                                                    >
                                                        删除
                                                    </Button>
                                                </Popconfirm>
                                            )}
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty description="暂无游记" />
                        )}
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default Profile;


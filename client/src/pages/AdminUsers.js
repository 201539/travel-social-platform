import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    message
} from 'antd';
import dayjs from 'dayjs';
import api from '../utils/api';
import { getAuth } from '../utils/auth';
import Loading from '../components/Loading';
import './AdminUsers.css';

const { Title, Text } = Typography;

const AdminUsers = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = getAuth();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [keyword, setKeyword] = useState('');
    const [isBanned, setIsBanned] = useState('');
    const [role, setRole] = useState('');

    const [banModalOpen, setBanModalOpen] = useState(false);
    const [banTarget, setBanTarget] = useState(null);
    const [banForm] = Form.useForm();

    const isAdmin = user?.role === 'admin';

    const queryKey = useMemo(() => ['adminUsers', { page, limit, keyword, isBanned, role }], [page, limit, keyword, isBanned, role]);

    const { data, isLoading, error } = useQuery(
        queryKey,
        async () => {
            const params = { page, limit };
            if (keyword && keyword.trim()) params.keyword = keyword.trim();
            if (isBanned !== '') params.isBanned = isBanned;
            if (role) params.role = role;
            return await api.get('/users', { params }); // 管理员列表接口
        },
        {
            enabled: isAdmin
        }
    );

    const banMutation = useMutation(
        async ({ userId, bannedReason, bannedUntil }) => {
            return await api.post(`/users/${userId}/ban`, {
                bannedReason,
                bannedUntil
            });
        },
        {
            onSuccess: () => {
                message.success('封禁成功');
                setBanModalOpen(false);
                setBanTarget(null);
                banForm.resetFields();
                queryClient.invalidateQueries('adminUsers');
            },
            onError: (e) => message.error(e?.message || '封禁失败')
        }
    );

    const unbanMutation = useMutation(
        async (userId) => {
            return await api.post(`/users/${userId}/unban`);
        },
        {
            onSuccess: () => {
                message.success('解封成功');
                queryClient.invalidateQueries('adminUsers');
            },
            onError: (e) => message.error(e?.message || '解封失败')
        }
    );

    if (!isAdmin) {
        return (
            <div className="admin-users-container">
                <Card>
                    <Title level={4} style={{ marginTop: 0 }}>用户管理</Title>
                    <Text type="secondary">无权限访问（仅管理员可用）</Text>
                    <div style={{ marginTop: 16 }}>
                        <Button type="primary" onClick={() => navigate('/')}>返回首页</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const users = data?.users || [];

    const openBanModal = (u) => {
        setBanTarget(u);
        banForm.setFieldsValue({
            bannedReason: u?.bannedReason || '',
            bannedUntil: u?.bannedUntil ? dayjs(u.bannedUntil) : null
        });
        setBanModalOpen(true);
    };

    const handleSubmitBan = async () => {
        const values = await banForm.validateFields();
        const payload = {
            userId: banTarget?._id,
            bannedReason: values.bannedReason || '',
            bannedUntil: values.bannedUntil ? values.bannedUntil.toISOString() : null
        };
        banMutation.mutate(payload);
    };

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            render: (v, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{v}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
                </Space>
            )
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (v) => (v === 'admin' ? <Tag color="gold">admin</Tag> : <Tag>user</Tag>)
        },
        {
            title: '游记数',
            dataIndex: 'travelCount',
            key: 'travelCount',
            width: 100
        },
        {
            title: '封禁状态',
            key: 'ban',
            render: (_, record) => {
                if (!record.isBanned) return <Tag color="green">正常</Tag>;
                const until = record.bannedUntil ? dayjs(record.bannedUntil).format('YYYY-MM-DD HH:mm') : '永久';
                return (
                    <Space direction="vertical" size={0}>
                        <Tag color="red">已封禁</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            截止：{until}
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v) => (v ? dayjs(v).format('YYYY-MM-DD') : '-')
        },
        {
            title: '操作',
            key: 'actions',
            width: 220,
            render: (_, record) => {
                const disableSelf = record._id === user?.id; // 后端也会拦截
                const disableAdmin = record.role === 'admin'; // 后端也会拦截
                return (
                    <Space>
                        <Button size="small" onClick={() => navigate(`/profile/${record._id}`)}>
                            查看
                        </Button>
                        {record.isBanned ? (
                            <Button
                                size="small"
                                type="primary"
                                disabled={disableSelf || disableAdmin}
                                loading={unbanMutation.isLoading}
                                onClick={() => unbanMutation.mutate(record._id)}
                            >
                                解封
                            </Button>
                        ) : (
                            <Button
                                size="small"
                                danger
                                disabled={disableSelf || disableAdmin}
                                onClick={() => openBanModal(record)}
                            >
                                封禁
                            </Button>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        <div className="admin-users-container">
            <Card>
                <div className="admin-users-header">
                    <Title level={4} style={{ margin: 0 }}>用户管理</Title>
                    <Button onClick={() => navigate('/')}>返回首页</Button>
                </div>

                <div className="admin-users-filters">
                    <Input.Search
                        placeholder="搜索用户名/邮箱"
                        allowClear
                        onSearch={(v) => {
                            setKeyword(v || '');
                            setPage(1);
                        }}
                        style={{ width: 320 }}
                    />
                    <Select
                        value={isBanned}
                        onChange={(v) => {
                            setIsBanned(v);
                            setPage(1);
                        }}
                        style={{ width: 160 }}
                        options={[
                            { label: '全部状态', value: '' },
                            { label: '正常', value: 'false' },
                            { label: '已封禁', value: 'true' }
                        ]}
                    />
                    <Select
                        value={role}
                        onChange={(v) => {
                            setRole(v);
                            setPage(1);
                        }}
                        style={{ width: 160 }}
                        options={[
                            { label: '全部角色', value: '' },
                            { label: 'user', value: 'user' },
                            { label: 'admin', value: 'admin' }
                        ]}
                    />
                    <Select
                        value={limit}
                        onChange={(v) => {
                            setLimit(v);
                            setPage(1);
                        }}
                        style={{ width: 140 }}
                        options={[
                            { label: '20/页', value: 20 },
                            { label: '50/页', value: 50 },
                            { label: '100/页', value: 100 }
                        ]}
                    />
                </div>

                {isLoading ? (
                    <Loading />
                ) : error ? (
                    <div style={{ padding: 16 }}>
                        <Text type="danger">{error?.message || '加载失败'}</Text>
                    </div>
                ) : (
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={users}
                        pagination={{
                            current: data?.currentPage || page,
                            total: data?.total || 0,
                            pageSize: limit,
                            showSizeChanger: false,
                            onChange: (p) => setPage(p)
                        }}
                    />
                )}
            </Card>

            <Modal
                title={`封禁用户：${banTarget?.username || ''}`}
                open={banModalOpen}
                onCancel={() => {
                    setBanModalOpen(false);
                    setBanTarget(null);
                    banForm.resetFields();
                }}
                onOk={handleSubmitBan}
                okText="确认封禁"
                okButtonProps={{ danger: true, loading: banMutation.isLoading }}
            >
                <Form form={banForm} layout="vertical">
                    <Form.Item name="bannedReason" label="封禁原因（可选）">
                        <Input.TextArea placeholder="最多建议 200 字" rows={3} />
                    </Form.Item>
                    <Form.Item name="bannedUntil" label="封禁截止时间（可选，不选表示永久）">
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUsers;


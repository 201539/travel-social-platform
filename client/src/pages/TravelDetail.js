import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Card, Empty, Button, Input, Avatar, Tag, Image, Popconfirm,
    message, Row, Col, Descriptions
} from 'antd';
import {
    LikeOutlined, StarOutlined, DeleteOutlined,
    UserOutlined, CalendarOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import { getAuth, isAuthenticated } from '../utils/auth';
import Loading from '../components/Loading';
import dayjs from 'dayjs';
import './TravelDetail.css';

const { TextArea } = Input;

const TravelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = getAuth();
    const [comment, setComment] = useState('');

    const { data: travel, isLoading } = useQuery(
        ['travel', id],
        () => api.get(`/travels/${id}`)
    );

    const likeMutation = useMutation(
        () => api.post(`/travels/${id}/like`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['travel', id]);
                message.success('操作成功');
            }
        }
    );

    const collectMutation = useMutation(
        () => api.post(`/travels/${id}/collect`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['travel', id]);
                message.success('操作成功');
            }
        }
    );

    const commentMutation = useMutation(
        () => api.post(`/travels/${id}/comment`, { content: comment }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['travel', id]);
                setComment('');
                message.success('评论成功');
            }
        }
    );

    const deleteMutation = useMutation(
        () => api.delete(`/travels/${id}`),
        {
            onSuccess: () => {
                message.success('删除成功');
                navigate('/');
            },
            onError: (error) => {
                message.error(error.response?.data?.message || '删除失败');
            }
        }
    );

    const handleLike = () => {
        if (!isAuthenticated()) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }
        likeMutation.mutate();
    };

    const handleCollect = () => {
        if (!isAuthenticated()) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }
        collectMutation.mutate();
    };

    const handleComment = () => {
        if (!isAuthenticated()) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }
        if (!comment.trim()) {
            message.warning('请输入评论内容');
            return;
        }
        commentMutation.mutate();
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!travel) {
        return <Empty description="游记不存在" />;
    }

    const isLiked = travel.likes?.some(like =>
        typeof like === 'object' ? like._id === user?.id : like === user?.id
    );
    const isCollected = travel.collections?.some(col =>
        typeof col === 'object' ? col._id === user?.id : col === user?.id
    );
    const canDelete = user && (user.id === travel.author?._id || user.role === 'admin');

    return (
        <div className="travel-detail-container">
            <Card 
                bodyStyle={{ 
                    overflow: 'visible',
                    maxHeight: 'none'
                }}
            >
                <div className="travel-header">
                    <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <span>{travel.title}</span>
                        {canDelete && (
                            <Popconfirm
                                title="确定要删除这篇游记吗？"
                                description="删除后无法恢复"
                                onConfirm={() => deleteMutation.mutate()}
                                okText="确定"
                                cancelText="取消"
                                okType="danger"
                            >
                                <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isLoading}>
                                    删除
                                </Button>
                            </Popconfirm>
                        )}
                    </h1>
                    <div className="travel-author">
                        <Avatar src={travel.author?.avatar} icon={<UserOutlined />} />
                        <span>{travel.author?.username}</span>
                        <span className="travel-date">
                            {dayjs(travel.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                    </div>
                </div>

                {travel.photos && travel.photos.length > 0 && (
                    <div className="travel-photos">
                        <Image.PreviewGroup>
                            <Row gutter={[8, 8]}>
                                {travel.photos.map((photo, index) => (
                                    <Col key={index} xs={24} sm={12} lg={8}>
                                        <Image src={photo} alt={`${travel.title}-${index}`} />
                                    </Col>
                                ))}
                            </Row>
                        </Image.PreviewGroup>
                    </div>
                )}

                <Descriptions column={2} className="travel-info">
                    <Descriptions.Item label={<CalendarOutlined />}>
                        {dayjs(travel.startDate).format('YYYY-MM-DD')} 至 {dayjs(travel.endDate).format('YYYY-MM-DD')}
                    </Descriptions.Item>
                    <Descriptions.Item label={<EnvironmentOutlined />}>
                        {travel.locationName || '未知地点'}
                    </Descriptions.Item>
                </Descriptions>

                {travel.tags && travel.tags.length > 0 && (
                    <div className="travel-tags">
                        {travel.tags.map((tag, index) => (
                            <Tag key={index} color="blue">{tag}</Tag>
                        ))}
                    </div>
                )}

                <div 
                    className="travel-description"
                    style={{
                        display: 'block',
                        overflow: 'visible',
                        maxHeight: 'none',
                        height: 'auto'
                    }}
                >
                    <div 
                        className="travel-description-content"
                        style={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            wordBreak: 'break-word',
                            overflow: 'visible',
                            display: 'block',
                            maxHeight: 'none',
                            WebkitLineClamp: 'unset',
                            WebkitBoxOrient: 'unset'
                        }}
                    >
                        {travel.description || '暂无描述'}
                    </div>
                </div>

                <div className="travel-actions">
                    <Button
                        type={isLiked ? 'primary' : 'default'}
                        icon={<LikeOutlined />}
                        onClick={handleLike}
                    >
                        点赞 ({travel.likes?.length || 0})
                    </Button>
                    <Button
                        type={isCollected ? 'primary' : 'default'}
                        icon={<StarOutlined />}
                        onClick={handleCollect}
                    >
                        收藏 ({travel.collections?.length || 0})
                    </Button>
                    <span className="travel-stats">
                        👁️ {travel.views || 0} 次浏览
                    </span>
                </div>
            </Card>

            <Card title="评论" className="comments-section">
                {travel.comments && travel.comments.length > 0 ? (
                    <div className="comments-list">
                        {travel.comments.map((comment, index) => (
                            <div key={index} className="comment-item">
                                <Avatar src={comment.user?.avatar} icon={<UserOutlined />} />
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <span className="comment-author">{comment.user?.username}</span>
                                        <span className="comment-date">
                                            {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                                        </span>
                                    </div>
                                    <div className="comment-text">{comment.content}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Empty description="暂无评论" />
                )}

                {isAuthenticated() && (
                    <div className="comment-input">
                        <TextArea
                            rows={4}
                            placeholder="写下你的评论..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <Button
                            type="primary"
                            onClick={handleComment}
                            loading={commentMutation.isLoading}
                            style={{ marginTop: 8 }}
                        >
                            发表评论
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TravelDetail;


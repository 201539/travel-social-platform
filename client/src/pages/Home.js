import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Card, Row, Col, Input, Pagination, Empty, Tag, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loading from '../components/Loading';
import WeatherCard from '../components/WeatherCard';
import { getAuth } from '../utils/auth';
import dayjs from 'dayjs';
import './Home.css';

const { Search } = Input;

const Home = () => {
    const navigate = useNavigate();
    const { user } = getAuth();
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    const { data, isLoading } = useQuery(
        ['travels', page, keyword],
        async () => {
            const params = { page, limit: 12 };
            if (keyword) params.keyword = keyword;
            const response = await api.get('/travels', { params });
            return response;
        }
    );

    const handleSearch = (value) => {
        if (!value || !value.trim()) {
            setKeyword('');
            setPage(1);
            return;
        }
        // 跳转到综合搜索页面
        navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    };


    const handleTravelClick = (id) => {
        navigate(`/travel/${id}`);
    };

    // 获取用户位置（用于天气显示）
    useEffect(() => {
        if (navigator.geolocation) {
            // 优先使用定位
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('获取到位置:', position.coords);
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('获取位置失败:', error);
                    // 如果获取位置失败，使用默认城市（南京）
                    setUserLocation({ city: '南京' });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            // 浏览器不支持地理位置，使用默认城市（南京）
            setUserLocation({ city: '南京' });
        }
    }, []);

    return (
        <div className="home-container">
            <div className="home-header">
                <h1>发现精彩旅行</h1>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Search
                        placeholder="搜索城市，获取游记、天气和餐厅推荐..."
                        allowClear
                        enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
                        size="large"
                        onSearch={handleSearch}
                        style={{ maxWidth: 700, flex: 1, minWidth: 300 }}
                    />
                    {user?.role === 'admin' && (
                        <Button onClick={() => navigate('/admin/users')}>
                            用户管理
                        </Button>
                    )}
                </div>
            </div>

            {/* 天气信息卡片 - 始终显示 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={24} lg={8}>
                    <WeatherCard
                        latitude={userLocation?.latitude}
                        longitude={userLocation?.longitude}
                        city={userLocation?.city || '南京'}
                    />
                </Col>
            </Row>

            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {data?.travels?.length > 0 ? (
                        <>
                            <Row gutter={[16, 16]}>
                                {data.travels.map((travel) => (
                                    <Col xs={24} sm={12} lg={8} key={travel._id}>
                                        <Card
                                            hoverable
                                            className="travel-card"
                                            cover={
                                                travel.photos?.length > 0 ? (
                                                    <img
                                                        alt={travel.title}
                                                        src={travel.photos[0]}
                                                        className="travel-image"
                                                    />
                                                ) : (
                                                    <div className="travel-image-placeholder">暂无图片</div>
                                                )
                                            }
                                            onClick={() => handleTravelClick(travel._id)}
                                        >
                                            <Card.Meta
                                                title={travel.title}
                                                description={
                                                    <div>
                                                        <div className="travel-description">
                                                            {travel.description || travel.summary || '暂无描述'}
                                                        </div>
                                                        {travel.tags && travel.tags.length > 0 && (
                                                            <div className="travel-tags" style={{ marginTop: 8, marginBottom: 8 }}>
                                                                {travel.tags.slice(0, 3).map((tag, idx) => (
                                                                    <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
                                                                        {tag}
                                                                    </Tag>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="travel-meta">
                                                            <span>@{travel.author?.username}</span>
                                                            <span>{dayjs(travel.createdAt).format('YYYY-MM-DD')}</span>
                                                        </div>
                                                        <div className="travel-stats">
                                                            <span>❤️ {travel.likes?.length || 0}</span>
                                                            <span>💬 {travel.comments?.length || 0}</span>
                                                            <span>👁️ {travel.views || 0}</span>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <div className="pagination-container">
                                <Pagination
                                    current={page}
                                    total={data.total}
                                    pageSize={12}
                                    onChange={setPage}
                                    showSizeChanger={false}
                                />
                            </div>
                        </>
                    ) : (
                        <Empty description="暂无游记" />
                    )}
                </>
            )}
        </div>
    );
};

export default Home;


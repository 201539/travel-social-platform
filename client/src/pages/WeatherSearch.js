import React, { useState } from 'react';
import { Card, Input, Button, Row, Col, Empty, message, Spin } from 'antd';
import { SearchOutlined, CloudOutlined } from '@ant-design/icons';
import api from '../utils/api';
import WeatherCard from '../components/WeatherCard';
import './WeatherSearch.css';

const { Search } = Input;

const WeatherSearch = () => {
    const [searchCity, setSearchCity] = useState('');
    const [searchedCity, setSearchedCity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (value) => {
        if (!value || !value.trim()) {
            message.warning('请输入城市名称');
            return;
        }

        const cityName = value.trim();
        setSearchCity(cityName);
        setLoading(true);
        setError(null);
        setSearchedCity(null);

        try {
            // 调用天气API
            const data = await api.get('/weather', {
                params: {
                    city: cityName,
                },
            });

            if (data && data.current) {
                setSearchedCity(cityName);
                message.success(`成功获取 ${cityName} 的天气信息`);
            } else {
                setError('未找到该城市的天气信息');
                message.error('未找到该城市的天气信息');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || '获取天气信息失败';
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="weather-search-container">
            <Card className="weather-search-header">
                <div className="search-header-content">
                    <CloudOutlined style={{ fontSize: 48, color: 'white', marginRight: 16 }} />
                    <div>
                        <h1>城市天气搜索</h1>
                        <p>输入城市名称，查询实时天气信息</p>
                    </div>
                </div>
            </Card>

            <Card className="weather-search-box">
                <Search
                    placeholder="请输入城市名称，如：北京、上海、南京、广州..."
                    allowClear
                    enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
                    size="large"
                    onSearch={handleSearch}
                    onChange={(e) => setSearchCity(e.target.value)}
                    value={searchCity}
                    loading={loading}
                    style={{ maxWidth: 600 }}
                />
            </Card>

            {loading && (
                <Card className="weather-result-card">
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16, color: '#666' }}>正在获取天气信息...</p>
                    </div>
                </Card>
            )}

            {error && !loading && (
                <Card className="weather-result-card">
                    <Empty
                        description={
                            <div>
                                <p style={{ color: '#ff4d4f', marginBottom: 8 }}>{error}</p>
                                <p style={{ color: '#999', fontSize: 12 }}>
                                    请检查城市名称是否正确，或稍后重试
                                </p>
                            </div>
                        }
                    />
                </Card>
            )}

            {searchedCity && !loading && !error && (
                <Card className="weather-result-card">
                    <div className="result-header">
                        <h2>
                            <CloudOutlined style={{ marginRight: 8 }} />
                            {searchedCity} 天气信息
                        </h2>
                    </div>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} lg={12}>
                            <WeatherCard city={searchedCity} />
                        </Col>
                    </Row>
                </Card>
            )}

            {!searchedCity && !loading && !error && (
                <Card className="weather-search-tips">
                    <h3>💡 使用提示</h3>
                    <ul>
                        <li>支持搜索中国主要城市，如：北京、上海、广州、深圳、杭州、南京等</li>
                        <li>支持搜索国际城市，如：纽约、伦敦、东京、巴黎等</li>
                        <li>建议使用城市的标准中文名称或英文名称</li>
                        <li>天气数据来源于心知天气API，实时更新</li>
                    </ul>
                </Card>
            )}
        </div>
    );
};

export default WeatherSearch;

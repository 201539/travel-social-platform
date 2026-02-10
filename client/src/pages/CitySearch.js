import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Card, Row, Col, Input, Empty, Tag, Spin, message, Tabs, Button } from 'antd';
import { SearchOutlined, CloudOutlined, ShopOutlined, FileTextOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import WeatherCard from '../components/WeatherCard';
import dayjs from 'dayjs';
import './CitySearch.css';

const { Search } = Input;

const CitySearch = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchCity, setSearchCity] = useState('');
    const [cityName, setCityName] = useState('');
    
    // 加载状态
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [restaurantLoading, setRestaurantLoading] = useState(false);
    const [weatherError, setWeatherError] = useState(null);
    const [restaurantError, setRestaurantError] = useState(null);
    
    // 数据状态
    const [weatherData, setWeatherData] = useState(null);
    const [restaurants, setRestaurants] = useState([]);

    // 获取游记数据
    const { data: travelsData, isLoading: travelsLoading } = useQuery(
        ['travels', cityName],
        async () => {
            if (!cityName) return null;
            const params = { page: 1, limit: 12, keyword: cityName };
            const response = await api.get('/travels', { params });
            return response;
        },
        {
            enabled: !!cityName,
            refetchOnWindowFocus: false
        }
    );

    // 获取天气信息
    const fetchWeather = async (city) => {
        if (!city) {
            console.log('fetchWeather: 城市名称为空，跳过');
            return;
        }
        
        console.log('fetchWeather: 开始获取天气，城市:', city);
        setWeatherLoading(true);
        setWeatherError(null);
        
        try {
            const data = await api.get('/weather', {
                params: { city: city }
            });
            
            console.log('fetchWeather: API返回数据', data);
            
            if (data && data.current) {
                setWeatherData(data);
                console.log('fetchWeather: 天气数据设置成功');
            } else {
                setWeatherError('未找到该城市的天气信息');
                console.log('fetchWeather: 未找到天气信息');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || '获取天气信息失败';
            setWeatherError(errorMsg);
            console.error('fetchWeather: 获取天气失败', err);
        } finally {
            setWeatherLoading(false);
            console.log('fetchWeather: 完成');
        }
    };

    // 获取餐厅推荐
    const fetchRestaurants = async (city) => {
        if (!city) {
            console.log('fetchRestaurants: 城市名称为空，跳过');
            return;
        }
        
        console.log('fetchRestaurants: 开始获取餐厅推荐，城市:', city);
        setRestaurantLoading(true);
        setRestaurantError(null);
        setRestaurants([]);
        
        try {
            const response = await api.post('/ai/recommend-restaurants', {
                city: city
            });
            
            console.log('fetchRestaurants: API返回数据', response);
            
            if (response && response.success && response.restaurants) {
                setRestaurants(response.restaurants);
                console.log('fetchRestaurants: 餐厅数据设置成功，数量:', response.restaurants.length);
            } else {
                setRestaurantError('获取餐厅推荐失败');
                console.log('fetchRestaurants: 获取餐厅推荐失败');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || '获取餐厅推荐失败';
            setRestaurantError(errorMsg);
            console.error('fetchRestaurants: 获取餐厅推荐失败', err);
        } finally {
            setRestaurantLoading(false);
            console.log('fetchRestaurants: 完成');
        }
    };

    // 统一的数据加载函数（用于useEffect）
    const loadAllData = async (city) => {
        if (!city || !city.trim()) {
            console.log('loadAllData: 城市名称为空，跳过加载');
            return;
        }
        
        const cityName = city.trim();
        console.log('loadAllData: 开始加载数据，城市:', cityName);
        
        // 重置状态
        setWeatherError(null);
        setRestaurantError(null);
        setWeatherData(null);
        setRestaurants([]);
        
        // 同时获取天气和餐厅数据（游记通过useQuery自动获取，因为cityName变化会自动触发）
        try {
            await Promise.all([
                fetchWeather(cityName),
                fetchRestaurants(cityName)
            ]);
            console.log('loadAllData: 数据加载完成');
        } catch (error) {
            console.error('loadAllData: 加载数据时出错', error);
        }
    };

    // 处理搜索
    const handleSearch = async (value) => {
        if (!value || !value.trim()) {
            message.warning('请输入城市名称');
            return;
        }

        const city = value.trim();
        console.log('handleSearch: 搜索城市', city);
        
        // 先更新状态，确保cityName立即更新（这样useQuery会立即触发）
        setCityName(city);
        setSearchCity(city);
        
        // 更新URL参数（这会触发useEffect，但我们已经设置了cityName，所以useEffect不会重复加载）
        setSearchParams({ q: city });
        
        // 立即加载天气和餐厅数据（游记通过useQuery自动获取）
        console.log('handleSearch: 开始加载天气和餐厅数据');
        await Promise.all([
            fetchWeather(city),
            fetchRestaurants(city)
        ]);
        console.log('handleSearch: 所有数据加载完成');
    };

    // 如果URL中有搜索参数，自动搜索（首次加载或URL变化时）
    useEffect(() => {
        const queryCity = searchParams.get('q');
        console.log('useEffect: URL参数变化', queryCity, '当前cityName:', cityName);
        
        if (queryCity && queryCity.trim()) {
            const city = queryCity.trim();
            // 只有当城市名称改变时才重新加载（避免重复调用）
            // 注意：这里需要检查，避免在handleSearch已经加载数据后重复加载
            if (city !== cityName) {
                console.log('useEffect: 城市名称改变，加载数据', city);
                setCityName(city);
                setSearchCity(city);
                // 加载所有数据
                loadAllData(city);
            } else {
                console.log('useEffect: 城市名称未改变，跳过加载（可能已由handleSearch加载）');
            }
        } else if (!queryCity && cityName) {
            // 如果URL中没有参数但cityName有值，清空状态
            console.log('useEffect: 清空状态');
            setCityName('');
            setSearchCity('');
            setWeatherData(null);
            setRestaurants([]);
        }
    }, [searchParams.get('q')]);

    const handleTravelClick = (id) => {
        navigate(`/travel/${id}`);
    };

    const tabItems = [
        {
            key: 'travels',
            label: (
                <span>
                    <FileTextOutlined />
                    相关游记 ({travelsData?.travels?.length || 0})
                </span>
            ),
            children: (
                <div className="search-results-section">
                    {travelsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: 16, color: '#666' }}>正在搜索相关游记...</p>
                        </div>
                    ) : travelsData?.travels?.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {travelsData.travels.map((travel) => (
                                <Col xs={24} sm={12} lg={8} key={travel._id}>
                                    <Card
                                        hoverable
                                        className="travel-card"
                                        cover={
                                            travel.photos?.length > 0 ? (
                                                <img
                                                    alt={travel.title}
                                                    src={travel.photos[0]}
                                                    style={{ height: 200, objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                                                    暂无图片
                                                </div>
                                            )
                                        }
                                        onClick={() => handleTravelClick(travel._id)}
                                    >
                                        <Card.Meta
                                            title={travel.title}
                                            description={
                                                <div>
                                                    <div style={{ 
                                                        color: '#666', 
                                                        margin: '8px 0',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {travel.description || '暂无描述'}
                                                    </div>
                                                    {travel.tags && travel.tags.length > 0 && (
                                                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                                                            {travel.tags.slice(0, 3).map((tag, idx) => (
                                                                <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
                                                                    {tag}
                                                                </Tag>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: 12, marginTop: 8 }}>
                                                        <span>@{travel.author?.username}</span>
                                                        <span>{dayjs(travel.createdAt).format('YYYY-MM-DD')}</span>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description={`暂无关于"${cityName}"的游记`} />
                    )}
                </div>
            )
        },
        {
            key: 'weather',
            label: (
                <span>
                    <CloudOutlined />
                    天气信息
                </span>
            ),
            children: (
                <div className="search-results-section">
                    {weatherLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: 16, color: '#666' }}>正在获取天气信息...</p>
                        </div>
                    ) : weatherError ? (
                        <Empty description={weatherError} />
                    ) : weatherData ? (
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={24} lg={12}>
                                <WeatherCard city={cityName} />
                            </Col>
                        </Row>
                    ) : (
                        <Empty description="请输入城市名称并搜索" />
                    )}
                </div>
            )
        },
        {
            key: 'restaurants',
            label: (
                <span>
                    <ShopOutlined />
                    餐厅推荐 ({restaurants.length})
                </span>
            ),
            children: (
                <div className="search-results-section">
                    {restaurantLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: 16, color: '#666' }}>正在为你查找</p>
                        </div>
                    ) : restaurantError ? (
                        <Empty description={restaurantError} />
                    ) : restaurants.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {restaurants.map((restaurant, index) => (
                                <Col xs={24} sm={12} lg={8} key={index}>
                                    <Card
                                        hoverable
                                        style={{ height: '100%' }}
                                        bodyStyle={{ padding: '16px' }}
                                    >
                                        <div style={{ marginBottom: 12 }}>
                                            <h3 style={{ margin: 0, fontSize: 18, color: '#333' }}>
                                                {restaurant.name || `餐厅 ${index + 1}`}
                                            </h3>
                                        </div>
                                        
                                        {restaurant.rating && (
                                            <div style={{ marginBottom: 8 }}>
                                                <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />
                                                <span style={{ color: '#666', fontSize: 14 }}>
                                                    {restaurant.rating}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {restaurant.cuisine && (
                                            <div style={{ marginBottom: 8 }}>
                                                <Tag color="blue">{restaurant.cuisine}</Tag>
                                            </div>
                                        )}
                                        
                                        {restaurant.location && (
                                            <div style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
                                                📍 {restaurant.location}
                                            </div>
                                        )}
                                        
                                        {restaurant.reason && (
                                            <div style={{ 
                                                color: '#666', 
                                                fontSize: 13, 
                                                lineHeight: 1.6,
                                                marginTop: 8
                                            }}>
                                                {restaurant.reason}
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description="请输入城市名称并搜索" />
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="city-search-container">
            <Card className="city-search-header">
                <div className="search-header-content">
                    <h1>城市综合搜索</h1>
                    <p>输入城市名称，同时获取游记、天气和餐厅推荐</p>
                </div>
            </Card>

            <Card className="city-search-box">
                <Search
                    placeholder="请输入城市名称，如：北京、上海、南京、广州..."
                    allowClear
                    enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
                    size="large"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    onSearch={handleSearch}
                    style={{ maxWidth: 700 }}
                />
            </Card>

            {cityName && (
                <Card className="city-search-results">
                    <div className="results-header">
                        <h2>
                            <SearchOutlined style={{ marginRight: 8 }} />
                            搜索结果：{cityName}
                        </h2>
                    </div>
                    
                    <Tabs
                        defaultActiveKey="travels"
                        items={tabItems}
                        size="large"
                    />
                </Card>
            )}

            {!cityName && (
                <Card className="city-search-tips">
                    <h3>💡 使用提示</h3>
                    <ul>
                        <li>输入城市名称，可同时获取该城市的游记、天气信息和餐厅推荐</li>
                        <li>支持搜索中国主要城市，如：北京、上海、广州、深圳、杭州、南京等</li>
                        <li>支持搜索国际城市，如：纽约、伦敦、东京、巴黎等</li>
                        <li>搜索结果分为三个标签页：相关游记、天气信息、餐厅推荐</li>
                    </ul>
                </Card>
            )}
        </div>
    );
};

export default CitySearch;

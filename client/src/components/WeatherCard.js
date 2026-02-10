import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spin, Alert } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import api from '../utils/api';
import './WeatherCard.css';

const WeatherCard = ({ latitude, longitude, city }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWeather = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get('/weather', {
                params: {
                    latitude,
                    longitude,
                },
            });
            console.log('天气数据:', data); // 调试用
            console.log('数据来源:', data.isRealData ? '✅ 真实API数据' : '⚠️ 模拟数据');
            if (data && data.current) {
                setWeather(data);
            } else {
                setError('天气数据格式错误');
            }
        } catch (err) {
            console.error('获取天气失败:', err);
            setError(err.message || '获取天气信息失败');
        } finally {
            setLoading(false);
        }
    }, [latitude, longitude]);

    const fetchWeatherByCity = useCallback(async (cityName) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get('/weather', {
                params: {
                    city: cityName,
                },
            });
            console.log('天气数据:', data); // 调试用
            console.log('数据来源:', data.isRealData ? '✅ 真实API数据' : '⚠️ 模拟数据或未知');
            if (data && data.current) {
                setWeather(data);
            } else {
                setError('天气数据格式错误');
            }
        } catch (err) {
            console.error('获取天气失败:', err);
            // 显示详细的错误信息
            const errorMsg = err.message || err.response?.data?.message || '获取天气信息失败';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // 确保至少有一个参数才发起请求
        if (latitude && longitude) {
            fetchWeather();
        } else if (city) {
            fetchWeatherByCity(city);
        } else {
            // 如果都没有，使用默认城市
            fetchWeatherByCity('北京');
        }
    }, [latitude, longitude, city, fetchWeather, fetchWeatherByCity]);

    if (loading) {
        return (
            <Card className="weather-card">
                <Spin size="small" />
                <span style={{ marginLeft: 8 }}>加载天气中...</span>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="weather-card">
                <Alert message={error} type="warning" showIcon />
            </Card>
        );
    }

    // 如果还在加载或没有数据，显示加载状态
    if (loading || (!weather && !error)) {
        return (
            <Card className="weather-card" title={<><CloudOutlined /> 天气信息</>}>
                <div className="weather-content">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="small" />
                        <span style={{ marginLeft: 8 }}>加载天气中...</span>
                    </div>
                </div>
            </Card>
        );
    }

    // 如果没有天气数据，显示错误或占位信息
    if (!weather || !weather.current) {
        return (
            <Card className="weather-card" title={<><CloudOutlined /> 天气信息</>}>
                <div className="weather-content">
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        {error || '暂无天气数据'}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card 
            className="weather-card" 
            title={
                <>
                    <CloudOutlined /> 天气信息
                    {weather.isRealData && (
                        <span style={{ 
                            fontSize: '12px', 
                            color: '#52c41a', 
                            marginLeft: 8,
                            fontWeight: 'normal'
                        }}>
                            ✅ 实时数据
                        </span>
                    )}
                </>
            }
        >
            <div className="weather-content">
                {/* 位置信息 */}
                <div style={{ 
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: '#666',
                    fontWeight: 500
                }}>
                    📍 {weather.location || city || '当前位置'}
                </div>
                
                {/* 主要天气信息 */}
                <div className="weather-main">
                    <div className="weather-temp">{weather.current.temperature}°C</div>
                    <div className="weather-condition">{weather.current.condition || '未知'}</div>
                </div>
                
                {/* API信息 */}
                <div style={{ 
                    marginTop: '16px', 
                    padding: '12px', 
                    background: '#f0f9ff', 
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1890ff',
                    textAlign: 'center',
                    border: '1px solid #91d5ff'
                }}>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                        实时天气数据 · 心知天气API
                    </div>
                </div>
                {weather.forecast && weather.forecast.length > 0 && (
                    <div className="weather-forecast">
                        <div className="forecast-title">未来3天预报</div>
                        <div className="forecast-list">
                            {weather.forecast.slice(0, 3).map((day, index) => (
                                <div key={index} className="forecast-item">
                                    <div className="forecast-date">
                                        {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="forecast-temp">
                                        {day.high}° / {day.low}°
                                    </div>
                                    <div className="forecast-condition">{day.condition}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default WeatherCard;

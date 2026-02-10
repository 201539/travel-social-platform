const express = require('express');
const axios = require('axios');
const router = express.Router();

// 获取天气信息
router.get('/', async (req, res) => {
    try {
        const { longitude, latitude, city } = req.query;

        // 如果没有提供经纬度或城市名称，返回错误
        if ((!longitude || !latitude) && !city) {
            return res.status(400).json({ message: '请提供经纬度或城市名称' });
        }

        // 获取API密钥
        const apiKey = process.env.WEATHER_API_KEY;

        // 如果没有配置API密钥，返回错误
        if (!apiKey || apiKey === 'your_weather_api_key' || apiKey.trim() === '') {
            console.warn('⚠️ WEATHER_API_KEY未配置，返回错误信息');
            return res.status(500).json({ 
                message: '天气API密钥未配置，请在server/.env中配置WEATHER_API_KEY',
                error: 'API_KEY_NOT_CONFIGURED',
                isRealData: false
            });
        }

        console.log('✅ 使用真实API密钥:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 3));

        // 实际API调用
        // 如果提供了经纬度，使用经纬度；否则使用城市名称
        let locationParam;
        if (latitude && longitude) {
            // 使用经纬度格式：纬度,经度
            locationParam = `${latitude},${longitude}`;
        } else if (city) {
            locationParam = city;
        } else {
            return res.status(400).json({ message: '请提供经纬度或城市名称' });
        }
        
        console.log('🌐 调用心知天气API:', { 
            location: locationParam, 
            apiKey: apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 3),
            timestamp: new Date().toISOString()
        });
        
        try {
            const apiUrl = `https://api.seniverse.com/v3/weather/now.json`;
            const requestParams = {
                key: apiKey.trim(), // 确保去除空格
                location: locationParam,
                language: 'zh-Hans',
                unit: 'c'
            };
            
            console.log('📡 API请求URL:', apiUrl);
            console.log('📡 API请求参数:', { ...requestParams, key: '***' });
            
            const response = await axios.get(apiUrl, {
                params: requestParams,
                timeout: 10000 // 10秒超时
            });
            
            console.log('✅ API调用成功，状态码:', response.status);
            console.log('📦 API返回数据:', JSON.stringify(response.data).substring(0, 200) + '...');

            // 心知天气API返回格式：{ results: [{ location: {...}, now: {...}, ... }] }
            if (response.data && response.data.results && response.data.results.length > 0) {
                const result = response.data.results[0];
                const now = result.now;
                const locationInfo = result.location;

                // 打印原始API返回数据，用于调试
                console.log('📦 API原始返回数据:', JSON.stringify(result, null, 2));
                console.log('📦 now对象字段:', Object.keys(now));

                // 免费版API只返回：text（天气现象）、code（天气代码）、temperature（温度）
                // 转换为前端期望的格式
                const weatherData = {
                    location: locationInfo.name || city || '未知',
                    current: {
                        temperature: parseInt(now.temperature) || 0,
                        condition: now.text || '未知',
                        code: now.code || null // 天气代码，可用于显示图标
                    },
                    forecast: [], // 如果需要预报，需要调用另一个API
                    isRealData: true, // 标记这是真实数据
                    apiSource: 'seniverse',
                    timestamp: new Date().toISOString(),
                    isFreePlan: true // 免费版API
                };
                
                console.log('✅ 返回真实天气数据（免费版）:', {
                    location: weatherData.location,
                    temperature: weatherData.current.temperature,
                    condition: weatherData.current.condition,
                    code: weatherData.current.code
                });
                
                return res.json(weatherData);
            } else {
                // API返回了数据但格式不对
                console.error('心知天气API返回格式异常:', response.data);
                return res.status(500).json({ 
                    message: '天气API返回数据格式异常',
                    error: 'INVALID_RESPONSE_FORMAT',
                    rawData: response.data
                });
            }
        } catch (apiError) {
            console.error('心知天气API调用失败:', apiError.response?.data || apiError.message);
            console.error('API错误详情:', {
                status: apiError.response?.status,
                statusText: apiError.response?.statusText,
                data: apiError.response?.data
            });
            
            // 如果API调用失败，返回错误信息而不是模拟数据
            const errorMessage = apiError.response?.data?.status || apiError.message || 'API调用失败';
            return res.status(500).json({ 
                message: `获取天气信息失败: ${errorMessage}`,
                error: 'WEATHER_API_ERROR',
                details: apiError.response?.data
            });
        }
    } catch (error) {
        res.status(500).json({ message: '获取天气信息失败', error: error.message });
    }
});

module.exports = router;


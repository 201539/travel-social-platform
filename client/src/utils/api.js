import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // 处理网络错误
        if (!error.response) {
            console.error('网络错误:', error.message);
            return Promise.reject({ message: '网络连接失败，请检查网络设置' });
        }

        // 处理401未授权
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // 避免在登录页面重复跳转
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // 返回错误信息
        const errorMessage = error.response?.data?.message ||
            `请求失败: ${error.response?.status || '未知错误'}`;
        return Promise.reject({ message: errorMessage, status: error.response?.status });
    }
);

export default api;


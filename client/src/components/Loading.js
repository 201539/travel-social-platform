import React from 'react';
import { Spin } from 'antd';
import './Loading.css';

const Loading = ({ tip = '加载中...', size = 'large' }) => {
    return (
        <div className="loading-container">
            <Spin size={size} tip={tip} />
        </div>
    );
};

export default Loading;


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 数据库连接
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_platform', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB连接成功: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB连接失败:', error.message);
        console.error('警告: 服务器将在没有数据库的情况下继续运行，但数据库功能将不可用');
        console.error('请安装MongoDB或配置MongoDB Atlas以使用完整功能');
        // 临时注释掉退出，允许服务器在没有数据库的情况下运行
        // process.exit(1);
        return null;
    }
};

connectDB().then(async (conn) => {
    if (!conn) return;
    try {
        const { ensureAdminUser } = require('./services/adminService');
        await ensureAdminUser();
    } catch (e) {
        console.error('初始化管理员账号失败:', e.message);
    }
});

// Socket.IO连接处理
io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);

    socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id);
    });
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/travels', require('./routes/travels'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/social', require('./routes/social'));
app.use('/api/files', require('./routes/files'));
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/navigation', require('./routes/navigation'));
app.use('/api/ai', require('./routes/ai'));

// 404处理（必须在路由之后）
app.use((req, res) => {
    res.status(404).json({ message: '接口不存在' });
});

// 错误处理中间件（必须在最后）
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = { app, io };


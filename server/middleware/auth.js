const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: '未提供认证令牌' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: '用户不存在' });
        }

        // 封禁校验：被封禁用户不允许访问需要登录的接口
        if (user.isBanned) {
            const now = new Date();
            const stillBanned = !user.bannedUntil || user.bannedUntil > now;
            if (stillBanned) {
                return res.status(403).json({
                    message: '账号已被封禁',
                    bannedReason: user.bannedReason || '',
                    bannedUntil: user.bannedUntil || null
                });
            }
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: '无效的认证令牌' });
    }
};

module.exports = auth;


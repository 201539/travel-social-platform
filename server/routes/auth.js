const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 验证输入
        if (!username || !email || !password) {
            return res.status(400).json({ message: '请填写所有必填字段' });
        }

        // 验证用户名格式
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ message: '用户名长度必须在3-20个字符之间' });
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: '邮箱格式不正确' });
        }

        // 验证密码强度
        if (password.length < 6) {
            return res.status(400).json({ message: '密码长度至少6个字符' });
        }

        // 检查用户是否已存在
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.trim() }]
        });

        if (existingUser) {
            return res.status(400).json({ message: '用户名或邮箱已存在' });
        }

        // 创建新用户
        const user = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: 'user'
        });
        await user.save();

        // 生成JWT令牌
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: '注册成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: '注册失败', error: error.message });
    }
});

// 登录
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: '请提供邮箱和密码' });
        }

        // 查找用户（邮箱不区分大小写）
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        // 封禁校验：被封禁用户不允许登录
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

        // 验证密码
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        // 生成JWT令牌
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: '登录失败', error: error.message });
    }
});

module.exports = router;


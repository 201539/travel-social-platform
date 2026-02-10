const express = require('express');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const User = require('../models/User');
const router = express.Router();

// 搜索用户（注意：必须放在 /:id 之前，否则会被 /:id 路由抢占）
router.get('/search/:keyword', async (req, res) => {
    try {
        const keyword = req.params.keyword;
        const users = await User.find({
            $or: [
                { username: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        })
            .select('-password')
            .limit(20);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '搜索失败', error: error.message });
    }
});

// 管理员：用户列表（分页/搜索/筛选）
router.get('/', auth, requireAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            keyword = '',
            isBanned,
            role
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = Math.min(parseInt(limit) || 20, 100);
        const skip = (pageNum - 1) * limitNum;

        const query = {};

        if (keyword && String(keyword).trim()) {
            const k = String(keyword).trim();
            query.$or = [
                { username: { $regex: k, $options: 'i' } },
                { email: { $regex: k, $options: 'i' } }
            ];
        }

        if (isBanned !== undefined && isBanned !== '') {
            if (String(isBanned) === 'true') query.isBanned = true;
            if (String(isBanned) === 'false') query.isBanned = false;
        }

        if (role && String(role).trim()) {
            query.role = String(role).trim();
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip(skip)
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            total
        });
    } catch (error) {
        res.status(500).json({ message: '获取用户列表失败', error: error.message });
    }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'username avatar')
            .populate('following', 'username avatar');

        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: '获取用户信息失败', error: error.message });
    }
});

// 更新用户信息
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: '无权修改此用户信息' });
        }

        const { username, bio, avatar } = req.body;
        const updateData = {};

        if (username) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ message: '更新成功', user });
    } catch (error) {
        res.status(500).json({ message: '更新失败', error: error.message });
    }
});

// 管理员：封禁用户（可选传 bannedUntil、bannedReason）
router.post('/:id/ban', auth, requireAdmin, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        if (targetUserId === req.user._id.toString()) {
            return res.status(400).json({ message: '不能封禁自己' });
        }

        const { bannedReason = '', bannedUntil = null } = req.body || {};
        const target = await User.findById(targetUserId);
        if (!target) {
            return res.status(404).json({ message: '用户不存在' });
        }
        if (target.role === 'admin') {
            return res.status(403).json({ message: '不能封禁管理员账号' });
        }

        target.isBanned = true;
        target.bannedReason = String(bannedReason || '').slice(0, 200);
        target.bannedUntil = bannedUntil ? new Date(bannedUntil) : null;
        await target.save();

        res.json({
            message: '封禁成功',
            user: {
                _id: target._id,
                isBanned: target.isBanned,
                bannedReason: target.bannedReason,
                bannedUntil: target.bannedUntil
            }
        });
    } catch (error) {
        res.status(500).json({ message: '封禁失败', error: error.message });
    }
});

// 管理员：解封用户
router.post('/:id/unban', auth, requireAdmin, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const target = await User.findById(targetUserId);
        if (!target) {
            return res.status(404).json({ message: '用户不存在' });
        }
        if (target.role === 'admin') {
            return res.status(403).json({ message: '不能操作管理员账号' });
        }

        target.isBanned = false;
        target.bannedReason = '';
        target.bannedUntil = null;
        await target.save();

        res.json({
            message: '解封成功',
            user: {
                _id: target._id,
                isBanned: target.isBanned,
                bannedReason: target.bannedReason,
                bannedUntil: target.bannedUntil
            }
        });
    } catch (error) {
        res.status(500).json({ message: '解封失败', error: error.message });
    }
});

module.exports = router;


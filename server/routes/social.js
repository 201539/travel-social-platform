const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// 关注用户
router.post('/follow/:userId', auth, async (req, res) => {
    try {
        const targetUserId = req.params.userId;

        if (targetUserId === req.user._id.toString()) {
            return res.status(400).json({ message: '不能关注自己' });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: '用户不存在' });
        }

        const currentUser = await User.findById(req.user._id);
        const isFollowing = currentUser.following.some(
            id => id.toString() === targetUserId
        );

        if (isFollowing) {
            // 取消关注
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== targetUserId
            );
            targetUser.followers = targetUser.followers.filter(
                id => id.toString() !== req.user._id.toString()
            );
        } else {
            // 关注
            currentUser.following.push(targetUserId);
            targetUser.followers.push(req.user._id);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({
            message: isFollowing ? '取消关注成功' : '关注成功',
            isFollowing: !isFollowing
        });
    } catch (error) {
        res.status(500).json({ message: '操作失败', error: error.message });
    }
});

// 获取关注列表
router.get('/following/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('following', 'username avatar bio travelCount');

        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json(user.following);
    } catch (error) {
        res.status(500).json({ message: '获取关注列表失败', error: error.message });
    }
});

// 获取粉丝列表
router.get('/followers/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('followers', 'username avatar bio travelCount');

        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json(user.followers);
    } catch (error) {
        res.status(500).json({ message: '获取粉丝列表失败', error: error.message });
    }
});

// 获取推荐用户（基于关注关系）
router.get('/recommend', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const followingIds = currentUser.following.map(id => id.toString());
        followingIds.push(req.user._id.toString());

        // 推荐：关注的人的关注的人（排除已关注的）
        const recommendedUsers = await User.find({
            _id: { $nin: followingIds },
            followers: { $in: currentUser.following }
        })
            .select('username avatar bio travelCount followers')
            .limit(10)
            .sort({ travelCount: -1 });

        res.json(recommendedUsers);
    } catch (error) {
        res.status(500).json({ message: '获取推荐失败', error: error.message });
    }
});

module.exports = router;


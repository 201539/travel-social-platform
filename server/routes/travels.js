const express = require('express');
const auth = require('../middleware/auth');
const { validateTravel } = require('../middleware/validate');
const Travel = require('../models/Travel');
const Location = require('../models/Location');
const router = express.Router();

// 创建游记
router.post('/', auth, validateTravel, async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            endDate,
            track,
            markPoints,
            photos,
            locationName,
            location,
            tags
        } = req.body;

        // 验证已在中间件完成

        // 处理tags - 确保是数组
        let tagsArray = [];
        if (tags) {
            if (Array.isArray(tags)) {
                tagsArray = tags;
            } else if (typeof tags === 'string') {
                tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
        }

        const travel = new Travel({
            title: title.trim(),
            description: description.trim(),
            author: req.user._id,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            track: track || [],
            markPoints: markPoints || [],
            photos: photos || [],
            locationName: locationName ? locationName.trim() : '',
            location: location && Array.isArray(location) && location.length === 2 ? {
                type: 'Point',
                coordinates: location
            } : undefined,
            tags: tagsArray
        });

        await travel.save();

        // 更新用户游记数量
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { travelCount: 1 }
        });

        // 关联地点
        if (location && locationName) {
            await updateLocationWithTravel(location, locationName, travel._id);
        }

        res.status(201).json({ message: '游记创建成功', travel });
    } catch (error) {
        res.status(500).json({ message: '创建游记失败', error: error.message });
    }
});

// 获取游记列表
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            author,
            location,
            keyword
        } = req.query;

        const query = {};
        if (author) query.author = author;
        if (keyword) {
            // 只搜索地点城市名称，不搜索标题和描述
            // 使用完全精确匹配，确保只有真正属于该城市的游记才会显示
            // 例如：搜索"南京"只会匹配locationName完全等于"南京"的游记
            const keywordTrim = keyword.trim();
            // 转义特殊字符，使用完全精确匹配（忽略大小写）
            const escapedKeyword = keywordTrim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.locationName = { 
                $regex: `^${escapedKeyword}$`, 
                $options: 'i' 
            };
            console.log('🔍 搜索条件:', { keyword: keywordTrim, locationName: query.locationName });
        }

        // 优化查询性能
        const limitNum = parseInt(limit) || 20;
        const pageNum = parseInt(page) || 1;
        const skip = (pageNum - 1) * limitNum;

        // 调试：打印查询条件
        if (keyword) {
            console.log('🔍 搜索游记 - 关键词:', keyword);
            console.log('🔍 查询条件:', JSON.stringify(query, null, 2));
        }

        const travels = await Travel.find(query)
            .populate('author', 'username avatar')
            .select('-track -markPoints') // 不返回轨迹和标记点以提升性能
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip)
            .lean(); // 使用lean()提升查询性能

        // 调试：验证结果
        if (keyword) {
            console.log('🔍 搜索结果数量:', travels.length);
            travels.forEach((travel, index) => {
                console.log(`  [${index + 1}] locationName: "${travel.locationName}" (匹配: ${travel.locationName.toLowerCase() === keyword.trim().toLowerCase() ? '✅' : '❌'})`);
            });
        }

        const total = await Travel.countDocuments(query);

        res.json({
            travels,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            total
        });
    } catch (error) {
        res.status(500).json({ message: '获取游记列表失败', error: error.message });
    }
});

// 获取单个游记
router.get('/:id', async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.id)
            .populate('author', 'username avatar bio')
            .populate('likes', 'username avatar')
            .populate('comments.user', 'username avatar')
            .lean();

        if (!travel) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 异步更新浏览量（不阻塞响应）
        Travel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

        res.json(travel);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: '游记不存在' });
        }
        res.status(500).json({ message: '获取游记失败', error: error.message });
    }
});

// 更新游记
router.put('/:id', auth, async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.id);
        if (!travel) {
            return res.status(404).json({ message: '游记不存在' });
        }

        if (travel.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '无权修改此游记' });
        }

        // 只更新允许的字段
        const allowedFields = ['title', 'description', 'startDate', 'endDate', 'photos', 'tags', 'locationName', 'location'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'tags' && typeof req.body[field] === 'string') {
                    travel[field] = req.body[field].split(',').map(tag => tag.trim()).filter(tag => tag);
                } else if (field === 'location' && Array.isArray(req.body[field]) && req.body[field].length === 2) {
                    travel[field] = {
                        type: 'Point',
                        coordinates: req.body[field]
                    };
                } else {
                    travel[field] = req.body[field];
                }
            }
        });
        travel.updatedAt = new Date();
        await travel.save();

        res.json({ message: '更新成功', travel });
    } catch (error) {
        res.status(500).json({ message: '更新失败', error: error.message });
    }
});

// 删除游记
router.delete('/:id', auth, async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.id);
        if (!travel) {
            return res.status(404).json({ message: '游记不存在' });
        }

        const isAuthor = travel.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: '无权删除此游记' });
        }

        await Travel.findByIdAndDelete(req.params.id);

        // 更新用户游记数量
        const User = require('../models/User');
        await User.findByIdAndUpdate(travel.author, {
            $inc: { travelCount: -1 }
        });

        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败', error: error.message });
    }
});

// 点赞游记
router.post('/:id/like', auth, async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.id);
        if (!travel) {
            return res.status(404).json({ message: '游记不存在' });
        }

        const isLiked = travel.likes.some(
            like => like.toString() === req.user._id.toString()
        );

        if (isLiked) {
            travel.likes = travel.likes.filter(
                like => like.toString() !== req.user._id.toString()
            );
        } else {
            travel.likes.push(req.user._id);
        }

        await travel.save();
        res.json({ message: isLiked ? '取消点赞' : '点赞成功', travel });
    } catch (error) {
        res.status(500).json({ message: '操作失败', error: error.message });
    }
});

// 评论游记
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: '评论内容不能为空' });
        }

        const travel = await Travel.findById(req.params.id);
        if (!travel) {
            return res.status(404).json({ message: '游记不存在' });
        }

        travel.comments.push({
            user: req.user._id,
            content
        });

        await travel.save();
        await travel.populate('comments.user', 'username avatar');

        res.json({ message: '评论成功', travel });
    } catch (error) {
        res.status(500).json({ message: '评论失败', error: error.message });
    }
});

// 收藏游记
router.post('/:id/collect', auth, async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.id);
        if (!travel) {
            return res.status(404).json({ message: '游记不存在' });
        }

        const isCollected = travel.collections.some(
            col => col.toString() === req.user._id.toString()
        );

        if (isCollected) {
            travel.collections = travel.collections.filter(
                col => col.toString() !== req.user._id.toString()
            );
        } else {
            travel.collections.push(req.user._id);
        }

        await travel.save();
        res.json({ message: isCollected ? '取消收藏' : '收藏成功', travel });
    } catch (error) {
        res.status(500).json({ message: '操作失败', error: error.message });
    }
});

// 辅助函数：更新地点与游记的关联
async function updateLocationWithTravel(coordinates, name, travelId) {
    let location = await Location.findOne({
        'location.coordinates': coordinates
    });

    if (!location) {
        location = new Location({
            name,
            location: {
                type: 'Point',
                coordinates
            },
            travels: [travelId]
        });
    } else {
        if (!location.travels.includes(travelId)) {
            location.travels.push(travelId);
        }
        location.visitCount += 1;
    }

    await location.save();
}

module.exports = router;


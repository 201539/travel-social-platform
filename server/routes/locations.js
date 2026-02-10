const express = require('express');
const Location = require('../models/Location');
const Travel = require('../models/Travel');
const router = express.Router();

// 获取地点详情（包含该地点的所有游记）
router.get('/:id', async (req, res) => {
    try {
        const location = await Location.findById(req.params.id)
            .populate({
                path: 'travels',
                populate: {
                    path: 'author',
                    select: 'username avatar'
                }
            });

        if (!location) {
            return res.status(404).json({ message: '地点不存在' });
        }

        res.json(location);
    } catch (error) {
        res.status(500).json({ message: '获取地点信息失败', error: error.message });
    }
});

// 搜索地点
router.get('/search/nearby', async (req, res) => {
    try {
        const { longitude, latitude, distance = 5000 } = req.query;

        if (!longitude || !latitude) {
            return res.status(400).json({ message: '请提供经纬度' });
        }

        const locations = await Location.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(distance)
                }
            }
        })
            .populate('travels', 'title photos')
            .limit(20);

        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: '搜索失败', error: error.message });
    }
});

// 搜索地点（按名称）
router.get('/search/:keyword', async (req, res) => {
    try {
        const keyword = req.params.keyword;
        const locations = await Location.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { address: { $regex: keyword, $options: 'i' } }
            ]
        })
            .populate('travels', 'title photos')
            .limit(20);

        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: '搜索失败', error: error.message });
    }
});

// 获取热门地点
router.get('/popular/list', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const locations = await Location.find()
            .sort({ visitCount: -1, rating: -1 })
            .limit(parseInt(limit))
            .populate('travels', 'title photos');

        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: '获取热门地点失败', error: error.message });
    }
});

// 获取地点的所有游记
router.get('/:id/travels', async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ message: '地点不存在' });
        }

        const travels = await Travel.find({
            _id: { $in: location.travels }
        })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 });

        res.json(travels);
    } catch (error) {
        res.status(500).json({ message: '获取游记失败', error: error.message });
    }
});

module.exports = router;


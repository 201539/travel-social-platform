const express = require('express');
const auth = require('../middleware/auth');
const Travel = require('../models/Travel');
const router = express.Router();

// 上传GPS轨迹点
router.post('/upload', auth, async (req, res) => {
    try {
        const { travelId, points } = req.body; // points: [[longitude, latitude, timestamp], ...]

        if (!travelId || !points || !Array.isArray(points)) {
            return res.status(400).json({ message: '请提供游记ID和轨迹点数据' });
        }

        const travel = await Travel.findById(travelId);
        if (!travel) {
            return res.status(404).json({ message: '游记不存在' });
        }

        if (travel.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '无权修改此游记' });
        }

        // 更新轨迹
        travel.track = points.map(point => [point[0], point[1]]);
        await travel.save();

        res.json({ message: '轨迹上传成功', travel });
    } catch (error) {
        res.status(500).json({ message: '上传轨迹失败', error: error.message });
    }
});

// 获取轨迹
router.get('/:travelId', async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.travelId)
            .select('track markPoints');

        if (!travel) {
            return res.status(404).json({ message: '游记不存在' });
        }

        res.json({
            track: travel.track,
            markPoints: travel.markPoints
        });
    } catch (error) {
        res.status(500).json({ message: '获取轨迹失败', error: error.message });
    }
});

module.exports = router;


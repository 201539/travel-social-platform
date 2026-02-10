const express = require('express');
const mapService = require('../services/mapService');
const router = express.Router();

// 路线规划（驾车）
router.post('/route/driving', async (req, res) => {
    try {
        const { origin, destination, strategy = '0' } = req.body;

        if (!origin || !destination || !origin.longitude || !origin.latitude || 
            !destination.longitude || !destination.latitude) {
            return res.status(400).json({ message: '请提供起点和终点的经纬度' });
        }

        const route = await mapService.planRoute(origin, destination, strategy);

        if (!route) {
            return res.status(404).json({ message: '路线规划失败，请检查起点和终点或配置地图API密钥' });
        }

        res.json({
            message: '路线规划成功',
            route: route
        });
    } catch (error) {
        res.status(500).json({ message: '路线规划失败', error: error.message });
    }
});

// 路线规划（步行）
router.post('/route/walking', async (req, res) => {
    try {
        const { origin, destination } = req.body;

        if (!origin || !destination || !origin.longitude || !origin.latitude || 
            !destination.longitude || !destination.latitude) {
            return res.status(400).json({ message: '请提供起点和终点的经纬度' });
        }

        const route = await mapService.planWalkingRoute(origin, destination);

        if (!route) {
            return res.status(404).json({ message: '路线规划失败，请检查起点和终点或配置地图API密钥' });
        }

        res.json({
            message: '路线规划成功',
            route: route
        });
    } catch (error) {
        res.status(500).json({ message: '路线规划失败', error: error.message });
    }
});

// 路线规划（公交）
router.post('/route/transit', async (req, res) => {
    try {
        const { origin, destination, city = '' } = req.body;

        if (!origin || !destination || !origin.longitude || !origin.latitude || 
            !destination.longitude || !destination.latitude) {
            return res.status(400).json({ message: '请提供起点和终点的经纬度' });
        }

        const route = await mapService.planTransitRoute(origin, destination, city);

        if (!route) {
            return res.status(404).json({ message: '路线规划失败，请检查起点和终点或配置地图API密钥' });
        }

        res.json({
            message: '路线规划成功',
            route: route
        });
    } catch (error) {
        res.status(500).json({ message: '路线规划失败', error: error.message });
    }
});

module.exports = router;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Travel = require('../models/Travel');
const Location = require('../models/Location');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_platform';

async function initDatabase() {
    try {
        console.log('正在连接数据库...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('数据库连接成功');

        // 确保管理员账号存在（无论数据库是否已有数据）
        try {
            const { ensureAdminUser } = require('../services/adminService');
            await ensureAdminUser();
        } catch (e) {
            console.error('初始化管理员账号失败:', e.message);
        }

        // 检查是否已有数据
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('数据库已有数据，跳过初始化');
            process.exit(0);
        }

        console.log('开始初始化数据库...');

        // 创建示例用户
        const users = await User.create([
            {
                username: 'traveler1',
                email: 'traveler1@example.com',
                password: '123456',
                bio: '热爱旅行的摄影师',
            },
            {
                username: 'traveler2',
                email: 'traveler2@example.com',
                password: '123456',
                bio: '背包客，走遍世界',
            },
        ]);
        console.log(`创建了 ${users.length} 个示例用户`);

        // 创建示例地点
        const locations = await Location.create([
            {
                name: '北京天安门',
                location: {
                    type: 'Point',
                    coordinates: [116.3974, 39.9093],
                },
                address: '北京市东城区天安门广场',
                type: 'attraction',
                description: '中华人民共和国的象征',
            },
            {
                name: '上海外滩',
                location: {
                    type: 'Point',
                    coordinates: [121.4850, 31.2397],
                },
                address: '上海市黄浦区中山东一路',
                type: 'attraction',
                description: '上海最著名的景点之一',
            },
        ]);
        console.log(`创建了 ${locations.length} 个示例地点`);

        // 创建示例游记
        const travels = await Travel.create([
            {
                title: '北京三日游',
                description: '第一次来北京，参观了天安门、故宫、颐和园等著名景点，感受到了浓厚的历史文化氛围。',
                author: users[0]._id,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-03'),
                location: {
                    type: 'Point',
                    coordinates: [116.3974, 39.9093],
                },
                locationName: '北京',
                track: [
                    [116.3974, 39.9093],
                    [116.4039, 39.9150],
                    [116.3900, 39.9000],
                ],
                markPoints: [
                    {
                        location: {
                            type: 'Point',
                            coordinates: [116.3974, 39.9093],
                        },
                        name: '天安门',
                        type: 'attraction',
                        description: '中华人民共和国的象征',
                    },
                ],
                tags: ['北京', '历史', '文化'],
            },
            {
                title: '上海外滩夜景',
                description: '夜晚的外滩格外美丽，黄浦江两岸的灯光交相辉映，让人流连忘返。',
                author: users[1]._id,
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-02-01'),
                location: {
                    type: 'Point',
                    coordinates: [121.4850, 31.2397],
                },
                locationName: '上海',
                tags: ['上海', '夜景', '摄影'],
            },
        ]);
        console.log(`创建了 ${travels.length} 篇示例游记`);

        // 关联地点和游记
        locations[0].travels.push(travels[0]._id);
        locations[1].travels.push(travels[1]._id);
        await locations[0].save();
        await locations[1].save();

        console.log('数据库初始化完成！');
        console.log('\n示例账号：');
        console.log('用户1: traveler1@example.com / 123456');
        console.log('用户2: traveler2@example.com / 123456');

        process.exit(0);
    } catch (error) {
        console.error('初始化失败:', error);
        process.exit(1);
    }
}

initDatabase();


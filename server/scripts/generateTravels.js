const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const bcrypt = require('bcryptjs');
const path = require('path');

// 加载环境变量
const envPath = path.join(__dirname, '../.env');
if (require('fs').existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

// 导入模型
const User = require('../models/User');
const Travel = require('../models/Travel');

// 初始化OpenAI客户端
const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey || !String(apiKey).trim()) {
    console.warn('⚠️ 未配置 DEEPSEEK_API_KEY：将无法使用AI生成游记内容（脚本仍会继续，但会退回默认内容）');
}
const client = new OpenAI({
    apiKey: apiKey || 'MISSING_DEEPSEEK_API_KEY',
    baseURL: 'https://api.deepseek.com'
});

// 中国主要旅游城市及其坐标和特色
const cities = [
    { name: '北京', lng: 116.4074, lat: 39.9042, tags: ['历史', '文化', '古都'], attractions: ['故宫', '天安门', '长城', '颐和园'] },
    { name: '上海', lng: 121.4737, lat: 31.2304, tags: ['现代', '购物', '都市'], attractions: ['外滩', '东方明珠', '南京路', '豫园'] },
    { name: '杭州', lng: 120.1551, lat: 30.2741, tags: ['自然', '文化', '江南'], attractions: ['西湖', '灵隐寺', '雷峰塔', '千岛湖'] },
    { name: '成都', lng: 104.0668, lat: 30.5728, tags: ['美食', '文化', '休闲'], attractions: ['宽窄巷子', '大熊猫基地', '锦里', '都江堰'] },
    { name: '西安', lng: 108.9398, lat: 34.3416, tags: ['历史', '文化', '古都'], attractions: ['兵马俑', '大雁塔', '古城墙', '华清宫'] },
    { name: '重庆', lng: 106.5516, lat: 29.5630, tags: ['美食', '山城', '夜景'], attractions: ['洪崖洞', '解放碑', '磁器口', '长江索道'] },
    { name: '广州', lng: 113.2644, lat: 23.1291, tags: ['美食', '现代', '购物'], attractions: ['广州塔', '沙面', '陈家祠', '白云山'] },
    { name: '南京', lng: 118.7969, lat: 32.0603, tags: ['历史', '文化', '古都'], attractions: ['中山陵', '夫子庙', '明孝陵', '玄武湖'] },
    { name: '苏州', lng: 120.5853, lat: 31.2989, tags: ['园林', '江南', '文化'], attractions: ['拙政园', '留园', '周庄', '虎丘'] },
    { name: '厦门', lng: 118.1108, lat: 24.4798, tags: ['海滨', '文艺', '休闲'], attractions: ['鼓浪屿', '曾厝垵', '南普陀', '环岛路'] },
    { name: '青岛', lng: 120.3826, lat: 36.0671, tags: ['海滨', '啤酒', '欧式'], attractions: ['栈桥', '八大关', '崂山', '啤酒博物馆'] },
    { name: '大连', lng: 121.6147, lat: 38.9140, tags: ['海滨', '现代', '休闲'], attractions: ['星海广场', '老虎滩', '金石滩', '棒棰岛'] },
    { name: '昆明', lng: 102.7123, lat: 25.0406, tags: ['自然', '花都', '民族'], attractions: ['石林', '滇池', '翠湖', '世博园'] },
    { name: '丽江', lng: 100.2270, lat: 26.8550, tags: ['古城', '民族', '文艺'], attractions: ['丽江古城', '玉龙雪山', '束河古镇', '泸沽湖'] },
    { name: '桂林', lng: 110.2994, lat: 25.2742, tags: ['自然', '山水', '风景'], attractions: ['漓江', '阳朔', '象鼻山', '龙胜梯田'] },
    { name: '三亚', lng: 109.5082, lat: 18.2479, tags: ['海滨', '度假', '热带'], attractions: ['亚龙湾', '天涯海角', '南山寺', '蜈支洲岛'] },
    { name: '拉萨', lng: 91.1409, lat: 29.6456, tags: ['文化', '宗教', '高原'], attractions: ['布达拉宫', '大昭寺', '纳木错', '八廓街'] },
    { name: '乌鲁木齐', lng: 87.6168, lat: 43.8256, tags: ['民族', '文化', '边疆'], attractions: ['天山天池', '大巴扎', '红山公园', '南山牧场'] },
    { name: '哈尔滨', lng: 126.5358, lat: 45.8021, tags: ['冰雪', '欧式', '文化'], attractions: ['中央大街', '冰雪大世界', '太阳岛', '圣索菲亚教堂'] },
    { name: '长沙', lng: 112.9388, lat: 28.2282, tags: ['文化', '美食', '娱乐'], attractions: ['岳麓山', '橘子洲', '太平街', '湖南省博物馆'] },
    { name: '武汉', lng: 114.3162, lat: 30.5810, tags: ['文化', '历史', '美食'], attractions: ['黄鹤楼', '东湖', '户部巷', '武汉大学'] },
    { name: '天津', lng: 117.2008, lat: 39.0842, tags: ['文化', '历史', '现代'], attractions: ['古文化街', '意式风情区', '五大道', '天津之眼'] },
    { name: '深圳', lng: 114.0579, lat: 22.5431, tags: ['现代', '科技', '创新'], attractions: ['世界之窗', '大梅沙', '深圳湾', '欢乐谷'] },
    { name: '大连', lng: 121.6147, lat: 38.9140, tags: ['海滨', '现代', '休闲'], attractions: ['星海广场', '老虎滩', '金石滩', '棒棰岛'] },
    { name: '无锡', lng: 120.3119, lat: 31.4912, tags: ['江南', '园林', '文化'], attractions: ['鼋头渚', '灵山大佛', '三国城', '南禅寺'] },
    { name: '扬州', lng: 119.4129, lat: 32.3932, tags: ['江南', '文化', '园林'], attractions: ['瘦西湖', '个园', '何园', '大明寺'] },
    { name: '洛阳', lng: 112.4540, lat: 34.6197, tags: ['历史', '文化', '古都'], attractions: ['龙门石窟', '白马寺', '洛阳博物馆', '关林'] },
    { name: '开封', lng: 114.3076, lat: 34.7971, tags: ['历史', '文化', '古都'], attractions: ['清明上河园', '大相国寺', '开封府', '铁塔'] },
    { name: '张家界', lng: 110.4792, lat: 29.1172, tags: ['自然', '风景', '奇观'], attractions: ['天门山', '张家界国家森林公园', '黄龙洞', '宝峰湖'] },
    { name: '九寨沟', lng: 103.9092, lat: 33.2600, tags: ['自然', '风景', '奇观'], attractions: ['九寨沟', '黄龙', '若尔盖', '松潘古城'] }
];

// 用户名列表
const usernames = [
    '旅行达人小王', '背包客小李', '摄影爱好者', '美食探索家', '文化游者',
    '自然爱好者', '城市漫步者', '历史迷', '文艺青年', '冒险家',
    '慢游者', '深度旅行', '旅行日记', '看世界', '在路上',
    '旅行笔记', '游走四方', '旅行时光', '足迹', '旅行家'
];

// 生成随机日期（2025年1-12月）
function getRandomDate(month) {
    const year = 2025;
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDay = Math.floor(Math.random() * daysInMonth) + 1;
    const duration = Math.floor(Math.random() * 5) + 2; // 2-6天
    const endDay = Math.min(startDay + duration - 1, daysInMonth);
    
    const startDate = new Date(year, month - 1, startDay);
    const endDate = new Date(year, month - 1, endDay);
    
    return { startDate, endDate };
}

// 使用AI生成游记内容
async function generateTravelContent(city, attractions, month, tags) {
    try {
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        const monthName = monthNames[month - 1];
        
        const systemPrompt = `你是一位专业的旅行写作助手，擅长创作真实、生动、富有感染力的游记内容。

要求：
1. 内容要真实可信，基于实际旅游体验
2. 语言流畅自然，符合中文表达习惯
3. 包含具体的景点、美食、体验等细节
4. 字数控制在400-800字之间
5. 要有个人感受和真实体验
6. 直接输出游记正文，不需要标题或格式标记`;

        const userPrompt = `请帮我写一篇关于${city.name}的游记。

旅行时间：2025年${monthName}
主要景点：${attractions.join('、')}
标签：${tags.join('、')}

请写一篇生动有趣的游记，描述在${city.name}的旅行经历，包括：
- 游览的景点和感受
- 品尝的美食
- 当地的特色体验
- 旅行中的趣事或感悟

要求内容真实、生动，能够吸引读者。`;

        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 2000
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error(`生成${city.name}游记内容失败:`, error.message);
        // 返回默认内容
        return `这次${city.name}之旅让我收获满满。${attractions[0]}的壮丽景色让我印象深刻，${attractions[1] || attractions[0]}的文化底蕴也让我流连忘返。当地的美食更是让我大饱口福，这次旅行真是难忘的经历。`;
    }
}

// 生成游记标题
function generateTitle(city, month) {
    const monthNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
    const monthName = monthNames[month - 1];
    
    const titleTemplates = [
        `${city.name}${monthName}月游记：感受${city.name}的魅力`,
        `${monthName}月${city.name}之旅：一次难忘的旅行`,
        `在${city.name}的${monthName}月：记录我的旅行时光`,
        `${city.name}${monthName}月行记：探索${city.name}的美好`,
        `${monthName}月${city.name}游：发现不一样的${city.name}`
    ];
    
    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
}

// 获取图片URL（使用真实旅游图片）
function getImageUrls(city, attractions, count = 3) {
    const images = [];
    const width = 800;
    const height = 600;
    
    // 使用Unsplash的旅游相关图片
    // 根据城市名称和景点生成不同的图片
    const searchTerms = [
        city.name,
        ...attractions.slice(0, 2),
        'travel',
        'tourism'
    ];
    
    for (let i = 0; i < count; i++) {
        // 使用Unsplash Source API获取真实旅游图片
        const searchTerm = searchTerms[i % searchTerms.length];
        const imageId = Math.floor(Math.random() * 1000);
        
        // 使用Unsplash Source API（无需API密钥）
        // 格式：https://source.unsplash.com/800x600/?{search_term}
        // 或者使用更稳定的服务
        const imageUrl = `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(searchTerm)},travel&sig=${imageId}`;
        images.push(imageUrl);
    }
    
    return images;
}

// 创建用户
async function createUsers() {
    console.log('📝 开始创建用户...');
    const users = [];
    
    for (const username of usernames) {
        try {
            // 检查用户是否已存在
            let user = await User.findOne({ username });
            
            if (!user) {
                const email = `${username.replace(/\s/g, '')}@example.com`;
                const password = await bcrypt.hash('123456', 10);
                
                user = new User({
                    username,
                    email,
                    password,
                    bio: `热爱旅行，喜欢记录生活中的美好瞬间`,
                    travelCount: 0
                });
                
                await user.save();
                console.log(`✅ 创建用户: ${username}`);
            } else {
                console.log(`ℹ️ 用户已存在: ${username}`);
            }
            
            users.push(user);
        } catch (error) {
            console.error(`❌ 创建用户${username}失败:`, error.message);
        }
    }
    
    return users;
}

// 生成游记
async function generateTravels() {
    try {
        // 连接数据库
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_platform';
        console.log('🔌 正在连接MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB连接成功');

        // 创建用户
        const users = await createUsers();
        if (users.length === 0) {
            console.error('❌ 没有可用的用户');
            return;
        }

        console.log(`\n📚 开始生成游记...`);
        console.log(`📊 计划生成: ${cities.length} 个城市，每个城市3-5篇，总计约 ${cities.length * 4} 篇\n`);
        
        let successCount = 0;
        let failCount = 0;
        let cityIndex = 0;

        // 为每个城市生成多篇游记
        for (const city of cities) {
            cityIndex++;
            console.log(`\n📍 [${cityIndex}/${cities.length}] 处理城市: ${city.name}`);
            // 每个城市生成3-5篇游记
            const travelCount = Math.floor(Math.random() * 3) + 3; // 3-5篇
            
            for (let i = 0; i < travelCount; i++) {
                try {
                    // 随机选择月份（1-12月）
                    const month = Math.floor(Math.random() * 12) + 1;
                    const { startDate, endDate } = getRandomDate(month);
                    
                    // 随机选择用户
                    const author = users[Math.floor(Math.random() * users.length)];
                    
                    // 随机选择2-3个景点
                    const selectedAttractions = city.attractions
                        .sort(() => Math.random() - 0.5)
                        .slice(0, Math.min(3, city.attractions.length));
                    
                    // 生成标题
                    const title = generateTitle(city, month);
                    
                    // 使用AI生成内容
                    process.stdout.write(`  🤖 [${i + 1}/${travelCount}] 正在生成游记内容... `);
                    const description = await generateTravelContent(
                        city, 
                        selectedAttractions, 
                        month, 
                        city.tags
                    );
                    process.stdout.write('✅\n');
                    
                    // 生成图片
                    const photoCount = Math.floor(Math.random() * 3) + 2; // 2-4张
                    const photos = getImageUrls(city, selectedAttractions, photoCount);
                    
                    // 创建游记
                    const travel = new Travel({
                        title,
                        description,
                        author: author._id,
                        startDate,
                        endDate,
                        locationName: city.name,
                        location: {
                            type: 'Point',
                            coordinates: [city.lng, city.lat]
                        },
                        photos,
                        tags: city.tags,
                        views: Math.floor(Math.random() * 500) + 10,
                        likes: [],
                        comments: [],
                        collections: []
                    });
                    
                    await travel.save();
                    
                    // 更新用户游记数量
                    await User.findByIdAndUpdate(author._id, {
                        $inc: { travelCount: 1 }
                    });
                    
                    successCount++;
                    console.log(`     ✅ 创建成功: ${title} (${author.username})`);
                    
                    // 添加延迟，避免API调用过快
                    if (i < travelCount - 1) {
                        await new Promise(resolve => setTimeout(resolve, 3000)); // 3秒延迟
                    }
                    
                } catch (error) {
                    failCount++;
                    console.error(`     ❌ 创建失败:`, error.message);
                    // 即使失败也等待一下，避免API限流
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            // 城市之间稍作停顿
            if (cityIndex < cities.length) {
                console.log(`  ⏸️  城市 ${city.name} 完成，稍作停顿...\n`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log(`\n✨ 生成完成！`);
        console.log(`✅ 成功: ${successCount} 篇`);
        console.log(`❌ 失败: ${failCount} 篇`);
        console.log(`📊 总计: ${successCount + failCount} 篇`);

    } catch (error) {
        console.error('❌ 生成游记过程出错:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 数据库连接已关闭');
        process.exit(0);
    }
}

// 运行脚本
if (require.main === module) {
    generateTravels();
}

module.exports = { generateTravels };

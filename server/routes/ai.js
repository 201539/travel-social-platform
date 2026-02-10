const express = require('express');
const { OpenAI } = require('openai');
const auth = require('../middleware/auth');
const router = express.Router();

// 初始化OpenAI客户端（使用DeepSeek API）
const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey || !String(apiKey).trim()) {
    console.warn('⚠️ 未配置 DEEPSEEK_API_KEY：AI相关接口将不可用（请在 server/.env 配置）');
}
const client = new OpenAI({
    apiKey: apiKey || 'MISSING_DEEPSEEK_API_KEY',
    baseURL: 'https://api.deepseek.com'
});

// AI帮写游记内容
router.post('/write-travel', auth, async (req, res) => {
    try {
        const { title, locationName, startDate, endDate, tags, userPrompt } = req.body;

        // 构建系统提示词
        const systemPrompt = `你是一位专业的旅行写作助手，擅长创作生动、有趣、富有感染力的游记内容。

你的任务是帮助用户撰写游记内容，要求：
1. 内容要真实、生动，能够吸引读者
2. 语言要流畅自然，符合中文表达习惯
3. 可以适当加入一些细节描写，让游记更有画面感
4. 字数控制在200-500字之间
5. 如果用户提供了具体的要求或提示，请根据要求调整写作风格和内容重点
输出格式：直接输出游记正文内容，不需要额外的说明或格式标记。`;

        // 构建用户提示词
        let userPromptText = '';

        if (userPrompt && userPrompt.trim()) {
            // 如果用户提供了自定义提示
            userPromptText = userPrompt;
        } else {
            // 根据已有信息生成提示
            userPromptText = `请帮我写一篇游记，`;

            if (title) {
                userPromptText += `标题是：${title}。`;
            }

            if (locationName) {
                userPromptText += `旅行地点是：${locationName}。`;
            }

            if (startDate && endDate) {
                const start = new Date(startDate).toLocaleDateString('zh-CN');
                const end = new Date(endDate).toLocaleDateString('zh-CN');
                userPromptText += `旅行时间是：${start} 到 ${end}。`;
            }

            if (tags && tags.length > 0) {
                userPromptText += `标签包括：${tags.join('、')}。`;
            }

            userPromptText += `请写一篇生动有趣的游记内容，描述这次旅行的经历和感受。`;
        }

        console.log('🤖 AI帮写请求:', {
            title,
            locationName,
            userPrompt: userPrompt ? '用户自定义提示' : '自动生成提示'
        });

        // 调用DeepSeek API
        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPromptText }
            ],
            temperature: 0.8, // 增加一些创造性
            max_tokens: 1500
        });

        const generatedContent = response.choices[0].message.content.trim();

        console.log('✅ AI生成成功，内容长度:', generatedContent.length);

        res.json({
            success: true,
            content: generatedContent
        });

    } catch (error) {
        console.error('❌ AI帮写失败:', error);
        res.status(500).json({
            success: false,
            message: 'AI帮写失败，请稍后重试',
            error: error.message
        });
    }
});

// AI推荐餐厅
router.post('/recommend-restaurants', async (req, res) => {
    try {
        const { city } = req.body;

        if (!city || !city.trim()) {
            return res.status(400).json({
                success: false,
                message: '请提供城市名称'
            });
        }

        const cityName = city.trim();

        // 构建系统提示词
        const systemPrompt = `你是一位专业的美食推荐助手，擅长为旅行者推荐各地的高分餐厅。

你的任务是帮助用户推荐指定城市的高分餐厅，要求：
1. 推荐5-8家该城市的知名高分餐厅
2. 包含餐厅名称、菜系类型、推荐理由、大概位置或区域
3. 优先推荐评分高、口碑好的餐厅
4. 可以涵盖不同菜系和价位
5. 内容要真实可信，基于实际存在的餐厅
6. 语言要简洁明了，便于用户参考

输出格式：使用JSON格式，包含restaurants数组，每个餐厅包含name（餐厅名称）、cuisine（菜系）、rating（评分，如4.5/5.0）、location（大概位置）、reason（推荐理由）字段。`;

        // 构建用户提示词
        const userPrompt = `请为我推荐${cityName}的高分餐厅，要求：
1. 推荐5-8家知名的高分餐厅
2. 包含餐厅名称、菜系类型、评分、大概位置、推荐理由
3. 优先推荐评分4.0以上的餐厅
4. 可以涵盖不同菜系（如本地菜、川菜、粤菜、西餐等）
5. 包含不同价位的餐厅（从平价到高端）

请以JSON格式返回，格式如下：
{
  "restaurants": [
    {
      "name": "餐厅名称",
      "cuisine": "菜系类型",
      "rating": "4.5/5.0",
      "location": "大概位置或区域",
      "reason": "推荐理由"
    }
  ]
}`;

        console.log('🍽️ AI餐厅推荐请求:', { city: cityName });

        // 调用DeepSeek API
        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7, // 稍微降低温度，确保推荐更准确
            max_tokens: 2000
        });

        const generatedContent = response.choices[0].message.content.trim();

        // 尝试解析JSON格式的响应
        let restaurants = [];
        try {
            // 尝试提取JSON部分
            const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                restaurants = parsed.restaurants || [];
            } else {
                // 如果AI返回的不是JSON格式，尝试解析文本格式
                // 这里可以添加文本解析逻辑，或者返回原始内容
                console.warn('AI返回的不是标准JSON格式，尝试解析文本');
                restaurants = [{
                    name: '解析失败',
                    cuisine: '未知',
                    rating: 'N/A',
                    location: cityName,
                    reason: 'AI返回格式异常，请重试'
                }];
            }
        } catch (parseError) {
            console.error('解析AI响应失败:', parseError);
            // 如果解析失败，返回原始内容作为单个推荐
            restaurants = [{
                name: '解析失败',
                cuisine: '未知',
                rating: 'N/A',
                location: cityName,
                reason: generatedContent.substring(0, 200) || '无法解析推荐内容'
            }];
        }

        console.log('✅ AI餐厅推荐成功，推荐数量:', restaurants.length);

        res.json({
            success: true,
            city: cityName,
            restaurants: restaurants,
            rawContent: generatedContent // 保留原始内容用于调试
        });

    } catch (error) {
        console.error('❌ AI餐厅推荐失败:', error);
        res.status(500).json({
            success: false,
            message: 'AI餐厅推荐失败，请稍后重试',
            error: error.message
        });
    }
});

module.exports = router;

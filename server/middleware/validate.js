// 请求验证中间件
const validateTravel = (req, res, next) => {
    const { title, description, startDate, endDate } = req.body;

    if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ message: '请填写所有必填字段' });
    }

    if (title.trim().length < 1 || title.trim().length > 100) {
        return res.status(400).json({ message: '标题长度必须在1-100个字符之间' });
    }

    if (description.trim().length < 1 || description.trim().length > 2000) {
        return res.status(400).json({ message: '内容长度必须在1-2000个字符之间' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: '日期格式不正确' });
    }

    if (start > end) {
        return res.status(400).json({ message: '结束日期不能早于开始日期' });
    }

    next();
};

module.exports = { validateTravel };


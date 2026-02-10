// 简单的速率限制中间件（可选，生产环境建议使用express-rate-limit）
const rateLimiter = (req, res, next) => {
    // 这里可以添加简单的速率限制逻辑
    // 生产环境建议使用 express-rate-limit 包
    next();
};

module.exports = rateLimiter;


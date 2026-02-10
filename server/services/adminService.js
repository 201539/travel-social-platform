const User = require('../models/User');

async function ensureAdminUser() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const shouldResetPassword = String(process.env.ADMIN_RESET_PASSWORD || '').toLowerCase() === 'true';

    if (!adminEmail || !adminUsername || !adminPassword) return;

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
        admin = new User({
            username: adminUsername,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            bio: '系统管理员'
        });
        await admin.save();
        console.log(`✅ 已创建管理员账号: ${adminEmail}`);
        return;
    }

    if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log(`✅ 已提升为管理员: ${adminEmail}`);
    }

    // 可选：强制重置管理员密码（用于忘记密码或已有旧管理员账号）
    if (shouldResetPassword) {
        admin.password = adminPassword;
        await admin.save();
        console.log(`✅ 已重置管理员密码: ${adminEmail}`);
    }
}

module.exports = { ensureAdminUser };


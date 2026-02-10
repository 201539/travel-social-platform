const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const router = express.Router();

// 配置multer用于文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});

// 上传单张图片
router.post('/upload', auth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的图片' });
        }

        // 在实际生产环境中，这里应该上传到OSS等云存储
        // 目前返回本地路径，使用完整URL
        const baseUrl = req.protocol + '://' + req.get('host');
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.json({
            message: '上传成功',
            url: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: '上传失败', error: error.message });
    }
});

// 上传多张图片
router.post('/upload/multiple', auth, upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '请选择要上传的图片' });
        }

        const baseUrl = req.protocol + '://' + req.get('host');
        const imageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);

        res.json({
            message: '上传成功',
            urls: imageUrls
        });
    } catch (error) {
        res.status(500).json({ message: '上传失败', error: error.message });
    }
});

module.exports = router;


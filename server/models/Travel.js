const mongoose = require('mongoose');

const markPointSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['attraction', 'restaurant', 'hotel', 'other'],
        default: 'other'
    },
    photos: [{
        type: String // 图片URL
    }],
    description: {
        type: String,
        maxlength: 500
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const travelSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 2000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    track: {
        type: [[Number]], // [[longitude, latitude], ...]
        default: []
    },
    markPoints: [markPointSchema],
    photos: [{
        type: String // 图片URL
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    locationName: {
        type: String,
        default: ''
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    collections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    summary: {
        type: String, // AI生成的摘要
        maxlength: 200
    },
    sentiment: {
        type: String, // AI分析的情感
        enum: ['positive', 'neutral', 'negative'],
        default: 'neutral'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 创建地理索引
travelSchema.index({ location: '2dsphere' });
travelSchema.index({ author: 1, createdAt: -1 });
travelSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Travel', travelSchema);


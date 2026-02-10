const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
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
    address: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['attraction', 'restaurant', 'hotel', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        maxlength: 1000
    },
    travels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Travel'
    }],
    photos: [{
        type: String // 图片URL
    }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    visitCount: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
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
locationSchema.index({ location: '2dsphere' });
locationSchema.index({ name: 'text' });

module.exports = mongoose.model('Location', locationSchema);


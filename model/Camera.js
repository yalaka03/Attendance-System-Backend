const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CameraSchema = new Schema({
    camera_name: {
        type: String,
        required: true
    },
    camera_location: {
        type: String,
        required: true
    },
    video_url: {
        type: String,
        required: true
    },
    thumbnail_url: {
        type: String,
        required: true
    },
    company_ref: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Ensure camera names are unique within a company
CameraSchema.index({ company_ref: 1, camera_name: 1 }, { unique: true });

module.exports = mongoose.model('Camera', CameraSchema);

const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
  weekId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  goal: {
    type: String,
    default: '',
  },
  time: {
    type: String,
    default: '',
  },
  materials: {
    type: [String],
    default: [],
  },
  order: {
    type: Number,
    required: true,
  },
});

const roadmapDataSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  certificationId: {
    type: Number,
    required: true,
  },
  priority: {
    type: String,
    default: '보통',
  },
  weeks: [weekSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('RoadmapData', roadmapDataSchema);

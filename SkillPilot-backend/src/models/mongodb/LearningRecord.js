const mongoose = require('mongoose');

const learningRecordSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
  studyHours: {
    type: Number,
    default: 0,
  },
  topics: {
    type: [String],
    default: [],
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LearningRecord', learningRecordSchema);

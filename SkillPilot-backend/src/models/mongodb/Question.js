const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  certificationId: {
    type: Number,
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: [arr => arr.length === 4, '보기는 4개여야 합니다'],
  },
  correctIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  difficulty: {
    type: String,
    enum: ['상', '중', '하'],
    default: '중',
  },
  explanation: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Question', questionSchema);

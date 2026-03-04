const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  certificationId: {
    type: Number,
    required: true,
  },
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedIndex: Number,
    isCorrect: Boolean,
  }],
  totalScore: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  subjectScores: [{
    subject: String,
    score: Number,
    type: { type: String },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('TestResult', testResultSchema);

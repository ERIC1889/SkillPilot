const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['certification_recommendation', 'roadmap_generation', 'wrong_answer_analysis'],
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  model: {
    type: String,
    default: 'gpt-3.5-turbo',
  },
  tokensUsed: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);

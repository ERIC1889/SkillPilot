const mongoose = require('mongoose');

const wrongAnswerNoteSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  testResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestResult',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  myAnswer: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
  tip: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WrongAnswerNote', wrongAnswerNoteSchema);

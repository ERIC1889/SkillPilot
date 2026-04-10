const mongoose = require('mongoose');

const turnSchema = new mongoose.Schema({
  role: { type: String, enum: ['interviewer', 'candidate', 'feedback'], required: true },
  text: { type: String, required: true },
  score: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const mockInterviewSessionSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  role: { type: String, required: true }, // 지원 직무
  certifications: { type: [String], default: [] },
  turns: { type: [turnSchema], default: [] },
  totalScore: { type: Number, default: null },
  done: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MockInterviewSession', mockInterviewSessionSchema);

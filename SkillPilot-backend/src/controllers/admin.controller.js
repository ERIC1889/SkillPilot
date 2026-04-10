const asyncHandler = require('../middlewares/asyncHandler');
const certSyncService = require('../services/certificationSync.service');
const questionBank = require('../services/questionBank.service');

const syncCertifications = asyncHandler(async (req, res) => {
  const result = await certSyncService.syncCertifications();
  res.json({ success: true, data: result });
});

const syncExamSchedules = asyncHandler(async (req, res) => {
  const result = await certSyncService.syncExamSchedules();
  res.json({ success: true, data: result });
});

const syncOpenQuestions = asyncHandler(async (req, res) => {
  const result = await certSyncService.syncOpenQuestions();
  res.json({ success: true, data: result });
});

const generateQuestions = asyncHandler(async (req, res) => {
  const { certificationId, perSubject } = req.body || {};
  const per = Number(perSubject) || 15;

  let result;
  if (certificationId) {
    result = await questionBank.ensureQuestionsForCertification(Number(certificationId), per);
  } else {
    result = await questionBank.ensureQuestionsForAll(per);
  }
  res.json({ success: true, data: result });
});

module.exports = {
  syncCertifications,
  syncExamSchedules,
  syncOpenQuestions,
  generateQuestions,
};

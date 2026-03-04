const asyncHandler = require('../middlewares/asyncHandler');
const cbtService = require('../services/cbt.service');

const getQuestions = asyncHandler(async (req, res) => {
  const { certificationId, count } = req.query;
  const questions = await cbtService.getQuestions(certificationId, count);
  res.json({ success: true, data: questions });
});

const submit = asyncHandler(async (req, res) => {
  const result = await cbtService.submit(req.userId, req.body);
  res.status(201).json({ success: true, data: result });
});

const getResults = asyncHandler(async (req, res) => {
  const results = await cbtService.getResults(req.userId);
  res.json({ success: true, data: results });
});

const getResultDetail = asyncHandler(async (req, res) => {
  const detail = await cbtService.getResultDetail(req.userId, req.params.testId);
  res.json({ success: true, data: detail });
});

module.exports = { getQuestions, submit, getResults, getResultDetail };

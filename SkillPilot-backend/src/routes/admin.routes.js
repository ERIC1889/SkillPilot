const router = require('express').Router();
const adminAuth = require('../middlewares/adminAuth');
const controller = require('../controllers/admin.controller');

router.use(adminAuth);

router.post('/sync/certifications', controller.syncCertifications);
router.post('/sync/exam-schedules', controller.syncExamSchedules);
router.post('/sync/open-questions', controller.syncOpenQuestions);
router.post('/generate-questions', controller.generateQuestions);

module.exports = router;

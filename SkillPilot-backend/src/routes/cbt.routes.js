const router = require('express').Router();
const cbtController = require('../controllers/cbt.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { submit } = require('../validations/cbt.validation');

router.get('/questions', auth, cbtController.getQuestions);
router.post('/submit', auth, validate(submit), cbtController.submit);
router.get('/results', auth, cbtController.getResults);
router.get('/results/:testId', auth, cbtController.getResultDetail);

module.exports = router;

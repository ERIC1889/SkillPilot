const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/mockInterview.controller');

router.use(auth);

router.post('/start', controller.start);
router.get('/', controller.list);
router.get('/:sessionId', controller.get);
router.post('/:sessionId/answer', controller.answer);

module.exports = router;

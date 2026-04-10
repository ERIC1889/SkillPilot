const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/learningRecord.controller');

router.use(auth);

router.get('/', controller.list);
router.get('/summary', controller.summary);
router.post('/', controller.create);
router.delete('/:id', controller.remove);

module.exports = router;

const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/job.controller');

router.get('/', controller.list);
router.get('/matches', auth, controller.matches);

module.exports = router;

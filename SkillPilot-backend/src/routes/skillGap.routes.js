const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/skillGap.controller');

router.use(auth);
router.get('/', controller.analyze);

module.exports = router;

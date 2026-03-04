const router = require('express').Router();
const profileController = require('../controllers/profile.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { setup, update } = require('../validations/profile.validation');

router.post('/setup', auth, validate(setup), profileController.setup);
router.get('/', auth, profileController.get);
router.put('/', auth, validate(update), profileController.update);

module.exports = router;

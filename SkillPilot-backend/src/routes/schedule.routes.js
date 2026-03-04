const router = require('express').Router();
const scheduleController = require('../controllers/schedule.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { create, update } = require('../validations/schedule.validation');

router.get('/', auth, scheduleController.get);
router.post('/', auth, validate(create), scheduleController.create);
router.put('/:id', auth, validate(update), scheduleController.update);
router.delete('/:id', auth, scheduleController.remove);

module.exports = router;

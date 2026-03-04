const router = require('express').Router();
const goalController = require('../controllers/goal.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createOrUpdate } = require('../validations/goal.validation');

router.post('/', auth, validate(createOrUpdate), goalController.createOrUpdate);
router.get('/', auth, goalController.get);
router.put('/', auth, validate(createOrUpdate), goalController.createOrUpdate);

module.exports = router;

const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { register, login } = require('../validations/auth.validation');

router.post('/register', validate(register), authController.register);
router.post('/login', validate(login), authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;

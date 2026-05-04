const router = require('express').Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/assistant.controller');

router.use(auth);

router.post('/chat', controller.chat);

module.exports = router;

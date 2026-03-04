const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth');

router.get('/', auth, dashboardController.getDashboard);

module.exports = router;

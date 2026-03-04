const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/profile', require('./profile.routes'));
router.use('/goals', require('./goal.routes'));
router.use('/certifications', require('./certification.routes'));
router.use('/roadmap', require('./roadmap.routes'));
router.use('/schedules', require('./schedule.routes'));
router.use('/portfolio', require('./portfolio.routes'));
router.use('/cbt', require('./cbt.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;

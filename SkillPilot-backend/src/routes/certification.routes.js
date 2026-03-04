const router = require('express').Router();
const certController = require('../controllers/certification.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { select } = require('../validations/certification.validation');

router.get('/recommended', auth, certController.getRecommended);
router.get('/rankings', certController.getRankings);
router.get('/', certController.getAll);
router.get('/:id', certController.getById);
router.post('/select', auth, validate(select), certController.selectCertifications);

module.exports = router;

const router = require('express').Router();
const roadmapController = require('../controllers/roadmap.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  generate, reorder, addWeek, updateWeek, updatePriority,
} = require('../validations/roadmap.validation');

router.post('/generate', auth, validate(generate), roadmapController.generate);
router.get('/', auth, roadmapController.get);
router.put('/reorder', auth, validate(reorder), roadmapController.reorder);
router.post('/weeks', auth, validate(addWeek), roadmapController.addWeek);
router.put('/weeks/:weekId', auth, validate(updateWeek), roadmapController.updateWeek);
router.delete('/weeks/:weekId', auth, roadmapController.deleteWeek);
router.put('/priority', auth, validate(updatePriority), roadmapController.updatePriority);

module.exports = router;

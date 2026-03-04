const router = require('express').Router();
const pc = require('../controllers/portfolio.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const v = require('../validations/portfolio.validation');

router.get('/', auth, pc.getFull);
router.put('/intro', auth, validate(v.updateIntro), pc.updateIntro);

// Skills
router.post('/skills', auth, validate(v.addSkill), pc.addSkill);
router.delete('/skills/:id', auth, pc.deleteSkill);

// Certs
router.post('/certs', auth, validate(v.addCert), pc.addCert);
router.delete('/certs/:id', auth, pc.deleteCert);

// Projects
router.post('/projects', auth, validate(v.addProject), pc.addProject);
router.put('/projects/:id', auth, validate(v.updateProject), pc.updateProject);
router.delete('/projects/:id', auth, pc.deleteProject);

// Links
router.put('/links', auth, validate(v.updateLinks), pc.updateLinks);

// Activities
router.post('/activities', auth, validate(v.addActivity), pc.addActivity);
router.put('/activities/:id', auth, validate(v.updateActivity), pc.updateActivity);
router.delete('/activities/:id', auth, pc.deleteActivity);

// Etc
router.put('/etc', auth, validate(v.updateEtc), pc.updateEtc);

// Public preview (no auth)
router.get('/preview/:userId', pc.getPreview);

module.exports = router;

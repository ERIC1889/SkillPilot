const router = require('express').Router();
const controller = require('../controllers/notice.controller');
const adminAuth = require('../middlewares/adminAuth');

// 공개: 목록 조회
router.get('/', controller.list);

// 관리자 전용: 등록/삭제
router.post('/', adminAuth, controller.create);
router.delete('/:id', adminAuth, controller.remove);

module.exports = router;

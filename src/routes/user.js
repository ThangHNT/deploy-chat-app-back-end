const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController.js');

router.get('/', userController.home);
router.post('/api/update/my-account', userController.updateAccount); // Cập nhật thông tin tài khoản
router.get('/api/receiver/:id', userController.getReciever); // lấy thông tin ng định gửi tin nhắn
router.post('/api/block-user', userController.blockUser); // chặn ng dùng
router.post('/api/unblock-user', userController.unblockUser); // bỏ chặn ng dùng
router.post('/api/check-block-status', userController.checkBlockStatus); // kiểm tra tình trạng chặn
router.get('/api/search', userController.searchUser); // tìm kiếm ng dùng trong hệ thống
router.post('/api/message-item', userController.messageItem); // lấy thông tin ng dùng và hiển thị bên sidebar
router.get('/api/get-message-item', userController.getAMessageItem); // lấy thông tin ng dùng ko có bên sidebar
router.post('/register', userController.register); // đk tk mới
router.post('/api/check-admin', userController.checkAdmin); // kiểm tra tài khoản xem có phải admin ko
router.post('/api/delete/force', userController.adminDeletePermission); // admin xóa bỏ tất cả tn or user or setting
router.post('/api/check-account', userController.checkAccount); // kiểm tra xem account còn trong db ko

router.post('/login', userController.login);

module.exports = router;

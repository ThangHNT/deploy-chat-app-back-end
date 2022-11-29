const express = require('express');
const router = express.Router();

const settingController = require('../controllers/SettingController');

router.post('/api/get-theme', settingController.getTheme); // lấy dữ liệu đã cài đặt trong đoạn chat
router.post('/api/change-theme', settingController.changeTheme); // thay đổi chủ đề đoạn chat
router.post('/api/set/background-image', settingController.setBackgroundImage); // thay đổi ảnh nền đoạn chat
router.post('/api/delete-all', settingController.deleteAll); // xóa tất cả các setting
router.post('/api/change/general-settings', settingController.changeGenaralSettings); // thay đổi cài đặt chung
router.get('/api/get/general-settings', settingController.getGeneralSettings); // lấy thông tin cài đặt chung

module.exports = router;

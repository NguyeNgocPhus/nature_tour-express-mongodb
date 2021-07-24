const express = require('express');

const authController = require('../controller/authController');
const router = express.Router();

router.post('/signup', authController.signup); /// đăng kí
router.post('/login', authController.login); //  đăng nhập
router.get('/logout', authController.logout);//thoát đăng nhập

module.exports = router;

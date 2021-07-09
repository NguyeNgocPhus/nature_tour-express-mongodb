const express = require('express');
const router = express.Router();
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

router.use(authController.isLogin);

router.get('/', authController.isLogin, viewController.overview);
router.get('/tour/:slug', authController.isLogin, viewController.getTour);
router.get('/login', authController.isLogin, viewController.login);
router.get('/me', authController.protect, viewController.me);
module.exports = router;

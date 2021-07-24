const express = require('express');
const router = express.Router();
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

router.use(authController.isLogin);

router.get(
  '/',
  bookingController.createBooking,
  authController.isLogin,
  viewController.overview
);
router.get('/tour/:slug', authController.isLogin, viewController.getTour);
router.get('/login', authController.isLogin, viewController.login);
router.get('/me', authController.protect, viewController.me);
router.get('/my-tours', authController.protect, viewController.getmytour);
module.exports = router;

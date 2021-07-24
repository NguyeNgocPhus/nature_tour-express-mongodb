const express = require('express');

const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

const router = express.Router();

router.get(
  "/booking/checkout-session/:tourId",
  authController.protect,
  bookingController.getCheckoutSession
); // tạo booking bằng stripe

module.exports = router;

const express = require('express');
const tourController = require('../controller/tourController');
const reviewRouter = require('./reviewRouter');
const router = express.Router();
const authController = require('../controller/authController');


router.use("/tours/:tourId/reviews", reviewRouter);
router
  .route("/tours/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tours/tour-stats").get(tourController.getTourStats);
router.route("/tours/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/tours/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.createTour
  );

router
  .route("/tours/:id")
  .get(tourController.getTour)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.updateTour
  )
  .delete(tourController.deleteTour);
router
  .route("/tours/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getTourWithin);

router
  .route("/tours/distances/:latlng/unit/:unit")
  .get(tourController.getDistances);
module.exports = router;

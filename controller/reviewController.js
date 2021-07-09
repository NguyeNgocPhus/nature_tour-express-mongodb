const Review = require('../models/reviewModel');

const Factory = require('./handleFactory');
const Tour = require('../models/tourModel');
exports.setTourUserIds = async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  console.log(req.params.tourId);
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = Factory.getAll(Review);
exports.getReview = Factory.getOne(Review);
exports.createReview = Factory.createOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.deleteReview = Factory.deleteOne(Review);

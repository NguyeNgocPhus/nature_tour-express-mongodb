const Tour = require('../models/tourModel');
const mongoose = require('mongoose');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports.overview = async (req, res, next) => {
  const tour = await Tour.find();
  //console.log(tour);
  res.render('overview', {
    title: 'dmmmmmmmmmmmmmmmmm',
    tours: tour,
  });
};
module.exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new appError('sai mm roi', 404));
  }
  res.render('tour', {
    title: `${tour.name}`,
    tour: tour,
  });
});
module.exports.login = async (req, res, next) => {
  res.render('login', {});
};
module.exports.me = async (req, res, next) => {
  res.render('account', {
    title: 'hello',
  });
};

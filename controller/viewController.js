const Tour = require('../models/tourModel');
const mongoose = require('mongoose');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/booking');
const User = require('../models/userModel');


///GET: http://localhost:3000/
// render trang trủ
module.exports.overview = async (req, res, next) => {
  const tour = await Tour.find();
  //console.log(tour);
  res.render("overview", {
    title: "dmmmmmmmmmmmmmmmmm",
    tours: tour,
  });
};

//GET :  http://localhost:3000/:slug
// render chi tiết tour
module.exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  if (!tour) {
    return next(new appError("sai mm roi", 404));
  }
  res.render("tour", {
    title: `${tour.name}`,
    tour: tour,
  });
});

// render form login
module.exports.login = async (req, res, next) => {
  res.render("login", {});
  console.log("ok");
};
/// render profile cá nhân
module.exports.me = async (req, res, next) => {
  res.render("account", {
    title: "hello",
  });
};
// /// render lịch sử mua tour của cá nhân
module.exports.getmytour = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  //console.log(user);
  var mytour = await Booking.find({ user: req.user.id });
  // mytour = await User.populate(mytour, { path: 'tour.guides' });
  const tourIDs = mytour.map((el) => el.tour._id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  //console.log(tours);
  res.render("overview", {
    title: "dmmmmmmmmmmmmmmmmm",
    tours: tours,
  });
};

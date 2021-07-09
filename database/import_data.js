const fs = require('fs');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

const db =
  'mongodb+srv://phu:1@cluster0.3hss4.mongodb.net/HIT?retryWrites=true&w=majority';
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const tour = JSON.parse(
  fs.readFileSync(`${__dirname}/data_tour.json`, 'utf-8')
);
const user = JSON.parse(
  fs.readFileSync(`${__dirname}/data_user.json`, 'utf-8')
);
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/data_review.json`, 'utf-8')
);

const importTour = async () => {
  try {
    await Tour.create(tour);
    // await User.insertMany(user);
    // await Review.insertMany(review);
    console.log('success');
  } catch (error) {
    console.log(error.message);
  }
};
const deleteTour = async () => {
  try {
    await Tour.deleteMany({});
    // await User.deleteMany({});
    // await Review.deleteMany({});
    console.log('success');
  } catch (error) {
    console.log(error.message);
  }
};
if (process.argv[2] === '--import') {
  importTour();
}
if (process.argv[2] === '--delete') {
  deleteTour();
}

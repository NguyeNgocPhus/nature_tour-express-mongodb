const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const createSendToken = async (user, status, res) => {
  const token = jwt.sign({ id: user._id }, 'phu', {
    expiresIn: 24 * 60 * 60 * 1000,
  });
  // console.log(token);
  const cookieOption = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', token, cookieOption);

  user.password = undefined;
  res.status(status).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

module.exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();
  //console.log(newUser);

  createSendToken(newUser, 200, res);
});

module.exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  //console.log(email);
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('not exists', 400));
  }

  const checkPassword = await user.correctPassword(password, user.password);

  if (!checkPassword) {
    //  console.log(checkPassword);
    return next(new AppError('password is wrrong', 400));
  }
  // console.log(user);
  createSendToken(user, 200, res);
});

module.exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

module.exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = jwt.verify(token, 'phu');

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  if (user.changedPasswordAfter(decoded.iat) === true) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  // console.log(user);
  req.user = user;
  res.locals.user = user;
  next();
});
module.exports.isLogin = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = jwt.verify(req.cookies.jwt, 'phu');

      const user = await User.findById(decoded.id);
      if (!user) {
        return next();
      }
      if (user.changedPasswordAfter(decoded.iat) === true) {
        return next();
      }

      res.locals.user = user;
    }
    return next();
  } catch (error) {
    return next();
  }
};

module.exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

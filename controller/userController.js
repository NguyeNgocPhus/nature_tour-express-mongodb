const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');
const jwt = require('jsonwebtoken');

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

const filterObj = async (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    // console.log(el);
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports.UpdateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = await filterObj(req.body, 'name', 'email');
  //console.log(filteredBody);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};
module.exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
module.exports.UpdateMyPassword = catchAsync(async (req, res, next) => {
  const password_current = req.body.password_current;
  const password1 = req.body.password;
  const password_confirm = req.body.password_confirm;
  if (password1 != password_confirm) {
    return next(new AppError('vui lòng nhập lại mật khẩu mới', 400));
  }

  const decoded = jwt.verify(req.cookies.jwt, 'phu');
  const user = await User.findById(decoded.id).select('+password');

  const check = await user.correctPassword(password_current, user.password);
  if (!check) {
    return next(new AppError('mật khẩu hiện tại của bạn không đúng', 400));
  }
  user.password = password1;
  await user.save();
  createSendToken(user, 200, res);
});
module.exports.getAllUsers = Factory.getAll(User);
module.exports.createUser = Factory.createOne(User);
module.exports.getUser = Factory.getOne(User);
module.exports.updateUser = Factory.updateOne(User);
module.exports.deleteUser = Factory.deleteOne(User);

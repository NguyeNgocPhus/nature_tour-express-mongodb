const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const appError = require('../utils/appError');
const Factory = require('../controller/handleFactory');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
// sử dụng multer để upload file
const multerStorage = multer.memoryStorage(); // lưu tạm file ở memory
 
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) { // kiểm tra có phải file ảnh ko
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// upload nhiểu hình ảnh
module.exports.uploadTourPhoto = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// điều chình file ảnh
module.exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover) { 
    return next();
  }
  req.files.imageCover.fieldname = `tour-${req.params.id}-${Date.now()}.jpeg`; // đặt tên
 
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) // đặt kích thước 
    .toFormat('jpeg') // đặt loại ảnh 
    .jpeg({ quality: 90 }) // chất lượng ảnh
    .toFile(`public/img/tours/${req.files.imageCover.fieldname}`); // chuyển đển file lưu

  req.body.imageCover = req.files.imageCover.fieldname;

  if (!req.files.images) {
    return next();
  }
  req.body.images = [];
  await Promise.all( // sử lý nhiều ảnh 
    req.files.images.map(async (file, i) => {
      file.fieldname = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;// đặt tên

      req.body.images.push(file.fieldname); 
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${file.fieldname}`);
    })
  );
  next();

});

module.exports.updateTour = Factory.updateOne(Tour);

/// top 5 tour xịn nhất
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

///GET : http://localhost:3000/api/v1/tours 
exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour, req.query)
      .filter()  
      .sort() 
      .limitFields()
      .paginate();
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
// GET : localhost:3000/api/v1/tours/:tourId
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
// tạo tour
exports.createTour = async (req, res) => {
  try {
    //
    req.body.guides = req.user.id;
    const newTour = await Tour.create(req.body);

    //  if (!newTour) res.send('faloi');
    res.status(201).json({
      status: 'success',
      data: {
        tour: 'asdasd',
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
//xóa tour
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// tìm tour theo  difficul
// GET : /api/v1/tours/tour-stats
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 }, // số tour
          numRatings: { $sum: '$ratingsQuantity' },// tổng đánh giá
          avgRating: { $avg: '$ratingsAverage' },// trung bình đánh giá
          avgPrice: { $avg: '$price' },// trung bình giá
          minPrice: { $min: '$price' },// giá tháp nhất
          maxPrice: { $max: '$price' },// giá cao nhất
        },
      },
      {
        $sort: { avgPrice: 1 }, // sort theo giá trung bình
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};


// tìm tour theo năm 
// GET :/api/v1/tours/monthly-plan/2021
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates', // tách mảng ngày 
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),/// lọc các tour có ngày bắt đầu nằm trong năm
            $lte: new Date(`${year}-12-31`),///
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' }, // group theo tháng
          numTourStarts: { $sum: 1 }, // tổng số tour
          tours: { $push: '$name' }, // tên tour
        },
      },
      {
        $addFields: { month: '$_id' }, // thêm cột month
      },
      {
        $project: {
          _id: 0, // ẩn cột _id
        },
      },
      {
        $sort: { month: 1 }, // sort theo tháng
      },
      {
        $limit: 12, // giới hạn 12 kết quả
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

///GET : /api/v1/tours/tours-within/400/center/40.650340, -74.387161/unit/mi

// tìm các tour trong khoang  :latlng  
module.exports.getTourWithin = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1; // đơn vị mi hoặc km
  if (!lat || !lng) {
    return next(new appError("not exists lat or lng", 404));
  }


  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  }); // tìm các tour trong khoảng [lng, lat]

  res.status(200).json({
    success: tour.length,
    tour: tour,
  });
};
// tính khoảng cách từ vị trí hiện tại đến các tour
/// GET : api/v1/tours/distances/40.650340, -74.387161/unit/mi
module.exports.getDistances = async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  //const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(new appError('not exists lat or lng', 404));
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    data: distances,
  });
};

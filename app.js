const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const tourRouter = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const authRouter = require('./router/authRouter');
const viewRouter = require('./router/viewRouter');
const bookingRouter = require('./router/bookingRouter');
const globalErrorHandler = require('./controller/errorController');
const bookingController = require("./controller/bookingController");
const cors = require("cors");

const compression = require("compression");
const app = express();
app.post(
  "/webhook-checkout",
  bodyParser.raw({ type: "application/json" }),
  bookingController.webhookCheckout
);
// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  //app.use(morgan('dev'));
}
app.use(compression());



app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  ///console.log(req.cookies);
  next();
});

// 3) ROUTES

app.use("/api/v1/tours", cors(), tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/", authRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/", viewRouter);
app.use(globalErrorHandler);

module.exports = app;

const express = require('express');

const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bookingController = require("./controller/bookingController");
const globalErrorHandler = require("./controller/errorController");
const router = require("./router/index");
const cors = require("cors");

const compression = require("compression");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.post(
  "/webhook-checkout",
  bodyParser.raw({ type: "application/json" }),
  bookingController.webhookCheckout
); // tạo hóa đơn

app.use(compression());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser());

router(app);
app.use(globalErrorHandler);

module.exports = app;

const express = require("express");
const router = express.Router();

const tourRouter = require("../router/tourRouter");
const userRouter = require("../router/userRouter");
const authRouter = require("../router/authRouter");
const bookingRouter = require("../router/bookingRouter");
const viewRouter = require("../router/viewRouter");
const routers = [tourRouter, userRouter, authRouter, bookingRouter, viewRouter];

module.exports = (app) => {
  routers.forEach((router) => {
    if (router == viewRouter) {
      app.use("/", router);
    } else {
      app.use("/api/v1", router);
    }
  });
};

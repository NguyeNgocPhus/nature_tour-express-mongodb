const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router
  .route("/users/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.patch(
  "/users/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.UpdateMe
);
router.delete(
  "/users/deleteMe",
  authController.protect,
  userController.deleteMe
);
router.patch(
  "/users/UpdateMyPassword",
  authController.protect,
  userController.UpdateMyPassword
);

router
  .route("/users/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

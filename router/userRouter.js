const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');
const router = express.Router();

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.patch('/updateMe', authController.protect, userController.UpdateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.patch(
  '/UpdateMyPassword',
  authController.protect,
  userController.UpdateMyPassword
);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  createUser,
} = require('../controllers/usersController');
const {
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  createNewUserRegistration,
  registerMe,
} = require('../controllers/authController');
const restictTo = require('../middlewares/restictTo');
const authProtect = require('../middlewares/authProtect');

const router = express.Router();

router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', authProtect, updatePassword);
router.patch('/updateMe', authProtect, updateMe);
router.delete('/deleteMe', authProtect, deleteMe);
router.post('/createNewUserRegistration', authProtect, restictTo('admin'), createNewUserRegistration);
router.patch('/registerMe/:token', registerMe);

router.route('/').get(authProtect, restictTo('admin'), getAllUsers).post(createUser);
router.route('/:id')
  .get(getUser)
  .patch(authProtect, restictTo('admin'), updateUser)
  .delete(authProtect, restictTo('admin'), deleteUser);

module.exports = router;

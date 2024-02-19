const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/usersController');
const {
  signup, login, forgotPassword, resetPassword,
} = require('../controllers/authController');
const restictTo = require('../middlewares/restictTo');
const authProtect = require('../middlewares/authProtect');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot', forgotPassword);
router.patch('/reset/:token', resetPassword);

// router.use(authProtect);

router.route('/').get(authProtect, restictTo('admin'), getAllUsers);
router.route('/:id').get(getUser).patch(authProtect, restictTo('admin'), updateUser).delete(authProtect, restictTo('admin'), deleteUser);

module.exports = router;

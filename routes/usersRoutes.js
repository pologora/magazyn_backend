const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/usersController');
const { signup, login } = require('../controllers/authController');
const authProtect = require('../middlewares/authProtect');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(authProtect, getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;

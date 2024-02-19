const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/usersController');
const { signup, login } = require('../controllers/authController');
// const authProtect = require('../middlewares/authProtect');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;

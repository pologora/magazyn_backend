const express = require('express');
const {
  getAllWorkTime, createWorkTime, getWorkTime, updateWorkTime, deleteWorkTime,
} = require('../controllers/worktimeController');
const authProtect = require('../middlewares/authProtect');
const restictTo = require('../middlewares/restictTo');

const router = express.Router();

router.route('/')
  .get(getAllWorkTime)
  .post(authProtect, restictTo('admin'), createWorkTime);

router.route('/:id')
  .get(getWorkTime)
  .patch(authProtect, restictTo('admin'), updateWorkTime)
  .delete(authProtect, restictTo('admin'), deleteWorkTime);

module.exports = router;

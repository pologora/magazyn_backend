const express = require('express');
const {
  getAllWorkTime, createWorkTime, getWorkTime, updateWorkTime, deleteWorkTime,
} = require('../controllers/worktimeController');

const router = express.Router();

router.route('/').get(getAllWorkTime).post(createWorkTime);
router.route('/:id').get(getWorkTime).patch(updateWorkTime).delete(deleteWorkTime);

module.exports = router;

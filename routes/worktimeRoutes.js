const express = require('express');
const {
  getAllWorktime, createWorkTime, getWorkTime, updateWorkTime, deleteWorkTime,
} = require('../controllers/worktimeController');

const router = express.Router();

router.route('/').get(getAllWorktime).post(createWorkTime);
router.route('/:id').get(getWorkTime).patch(updateWorkTime).delete(deleteWorkTime);

module.exports = router;

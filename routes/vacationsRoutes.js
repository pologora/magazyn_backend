const express = require('express');
const {
  getAllVacations, createVacation, getVacation, updateVacation, deleteVacation,
} = require('../controllers/vacationsController');

const router = express.Router();

router.route('/').get(getAllVacations).post(createVacation);
router.route('/:id').get(getVacation).patch(updateVacation).delete(deleteVacation);

module.exports = router;

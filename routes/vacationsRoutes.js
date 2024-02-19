const express = require('express');
const {
  getAllVacations, createVacation, getVacation, updateVacation, deleteVacation,
} = require('../controllers/vacationsController');

const router = express.Router();

const authProtect = require('../middlewares/authProtect');

router.route('/').get(authProtect, getAllVacations).post(createVacation);
router.route('/:id').get(getVacation).patch(updateVacation).delete(deleteVacation);

module.exports = router;

const express = require('express');
const {
  getAllVacations, createVacation, getVacation, updateVacation, deleteVacation,
} = require('../controllers/vacationsController');

const router = express.Router();

const authProtect = require('../middlewares/authProtect');

router.route('/')
  .get(getAllVacations)
  .post(authProtect, createVacation);

router.route('/:id')
  .get(getVacation)
  .patch(authProtect, updateVacation)
  .delete(authProtect, deleteVacation);

module.exports = router;

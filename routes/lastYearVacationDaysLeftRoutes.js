const express = require('express');
const { updateCreateLastYearDays, getAllLastYearDays } = require('../controllers/lastYearVacationDaysLeftController');
const authProtect = require('../middlewares/authProtect');
const restictTo = require('../middlewares/restictTo');

const router = express.Router();

router.route('/')
  .get(getAllLastYearDays)
  .post(authProtect, restictTo('admin'), updateCreateLastYearDays);

module.exports = router;

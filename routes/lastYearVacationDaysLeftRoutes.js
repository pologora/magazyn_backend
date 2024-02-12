const express = require('express');
const { updateCreateLastYearDays, getAllLastYearDays } = require('../controllers/lastYearVacationDaysLeftController');

const router = express.Router();

router.route('/').get(getAllLastYearDays).post(updateCreateLastYearDays);

module.exports = router;

const express = require('express');
const { getAllSntiRaport, getEmployeesOveralHours, getRaportByEmployeeId } = require('../controllers/raportsController');

const router = express.Router();

router.route('/').get(getEmployeesOveralHours);
router.route('/snti').get(getAllSntiRaport);
router.route('/:id').get(getRaportByEmployeeId);

module.exports = router;

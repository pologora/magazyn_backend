const express = require('express');
const {
  getAllAgencies, createAgency, getAgency, updateAgency, deleteAgency,
} = require('../controllers/agenciesController');

const router = express.Router();

router.route('/').get(getAllAgencies).post(createAgency);
router.route('/:id').get(getAgency).patch(updateAgency).delete(deleteAgency);

module.exports = router;

const express = require('express');
const {
  getAllAgencies, createAgency, getAgency, updateAgency, deleteAgency,
} = require('../controllers/agenciesController');
const authProtect = require('../middlewares/authProtect');
const restictTo = require('../middlewares/restictTo');

const router = express.Router();

router.route('/')
  .get(getAllAgencies)
  .post(authProtect, restictTo('admin'), createAgency);

router.route('/:id')
  .get(getAgency)
  .patch(authProtect, restictTo('admin'), updateAgency)
  .delete(authProtect, restictTo('admin'), deleteAgency);

module.exports = router;

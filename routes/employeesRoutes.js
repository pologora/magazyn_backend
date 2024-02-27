const express = require('express');
const {
  getAllEmployees, createEmployee, getEmployee, updateEmployee, deleteEmployee,
} = require('../controllers/employeesController');
const authProtect = require('../middlewares/authProtect');
const restictTo = require('../middlewares/restictTo');

const router = express.Router();

router.route('/')
  .get(getAllEmployees)
  .post(authProtect, restictTo('admin'), createEmployee);

router.route('/:id')
  .get(getEmployee)
  .patch(authProtect, restictTo('admin'), updateEmployee)
  .delete(authProtect, restictTo('admin'), deleteEmployee);

module.exports = router;

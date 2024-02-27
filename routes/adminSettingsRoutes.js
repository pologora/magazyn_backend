const express = require('express');

const { getAdminSettings, updateAdminSettings } = require('../controllers/adminSettingsController');
const authProtect = require('../middlewares/authProtect');
const restictTo = require('../middlewares/restictTo');

const router = express.Router();

router.route('/:id')
  .get(getAdminSettings)
  .patch(authProtect, restictTo('admin'), updateAdminSettings);

module.exports = router;

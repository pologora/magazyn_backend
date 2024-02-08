const express = require('express');

const { getAdminSettings, updateAdminSettings } = require('../controllers/adminSettingsController');

const router = express.Router();

router.route('/:id').get(getAdminSettings).patch(updateAdminSettings);

module.exports = router;

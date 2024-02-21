const express = require('express');
const {
  getAllVacationsProposal, createVacationProposal, deleteVacationProposal, updateVacationProposal,
  getVacationProposal,
} = require('../controllers/vacationsProposals');
const authProtect = require('../middlewares/authProtect');

const router = express.Router();

router.use(authProtect);

router.route('/').get(getAllVacationsProposal).post(createVacationProposal);
router.route('/:id').get(getVacationProposal).patch(updateVacationProposal).delete(deleteVacationProposal);

module.exports = router;

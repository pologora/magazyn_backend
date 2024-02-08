const express = require('express');
const {
  getAllVacationsProposal, createVacationProposal, deleteVacationProposal, updateVacationProposal,
  getVacationProposal,
} = require('../controllers/vacationsProposals');

const router = express.Router();

router.route('/').get(getAllVacationsProposal).post(createVacationProposal);
router.route('/:id').get(getVacationProposal).patch(updateVacationProposal).delete(deleteVacationProposal);

module.exports = router;

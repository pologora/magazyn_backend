const express = require('express');
const {
  getAllVacationsProposal, createVacationProposal, deleteVacationProposal, updateVacationProposal,
  getVacationProposal,
} = require('../controllers/vacationsProposals');
const authProtect = require('../middlewares/authProtect');

const router = express.Router();

router.use(authProtect);

router.route('/')
  .get(getAllVacationsProposal)
  .post(authProtect, createVacationProposal);

router.route('/:id')
  .get(getVacationProposal)
  .patch(authProtect, updateVacationProposal)
  .delete(authProtect, deleteVacationProposal);

module.exports = router;

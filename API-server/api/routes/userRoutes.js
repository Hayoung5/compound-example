const express = require('express');
const router = express.Router();
const { getMyBalance, getBalance, supplyEth, redeemCEth} = require('../controllers/etherController');

// GET
router.get('/mybalance', getMyBalance);

// GET
router.get('/balance', getBalance);

// POST
router.post('/supply/eth', supplyEth);

// POST
router.post('/redeem/ceth', redeemCEth);

// // POST /api/users
// router.post('/', createUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getMyBalance, 
        getBalance,
        supplyEth, 
        supplyErc20, 
        redeemCEth, 
        redeemCEthBasedUnderlying, 
        redeemCErc20, 
        redeemCErc20BasedUnderlying,
        getCErc20ExchangeRate,
        getCEthExchangeRate } = require('../controllers/supplyController');

const { enterMarket, 
        getMyLiquidity, 
        getMyCollateralFactor, 
        getPrice, 
        getEthBorrowRate,
        getErc20BorrowRate, 
        getEthBorrowBalance, 
        getErc20BorrowBalance, 
        borrowEth,
        borrowErc20, 
        repayEth, 
        repayErc20, } = require('../controllers/borrowController');

// GET
router.get('/myBalance', getMyBalance);
router.get('/balance', getBalance);
router.get('/cErc20ExchangeRate', getCErc20ExchangeRate);
router.get('/cEthExchangeRate', getCEthExchangeRate);
router.get('/myLiquidity', getMyLiquidity);
router.get('/myCollateralFactor', getMyCollateralFactor);
router.get('/price', getPrice);
router.get('/borrowRate/Eth', getEthBorrowRate);
router.get('/borrowRate/Erc20', getErc20BorrowRate);
router.get('/borrowBalance/Eth', getEthBorrowBalance);
router.get('/borrowBalance/Erc20', getErc20BorrowBalance);


// SUPPLY
router.post('/supply/eth', supplyEth);
router.post('/supply/erc20', supplyErc20);

// REDEEM
router.post('/redeemCEth/ctoken', redeemCEth);
router.post('/redeemCEth/underlying', redeemCEthBasedUnderlying);
router.post('/redeemCErc20/ctoken', redeemCErc20);
router.post('/redeemCErc20/underlying', redeemCErc20BasedUnderlying);

// BORROW
router.post('/borrow/enterMarket', enterMarket);
router.post('/borrow/Eth', borrowEth);
router.post('/borrow/Erc20', borrowErc20);

// REPAY
router.post('/repay/Eth', repayEth);
router.post('/repay/Erc20', repayErc20);

module.exports = router;
const dotenv = require("dotenv");
dotenv.config();

// controller using direct rpc call with ehter js
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.JSON_PRC_URL);
// Your Ethereum wallet private key
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const myWalletAddress = wallet.address;
const { checkInput, checkAddress } = require('../utils/helper.js');

const {
  cEthContractAddress,
  cTokenContractAddress,
  underlyingContractAddress,
  comptrollerAddress,
  priceFeedAddress,
  assetName,
  ethDecimals,
  cEthDecimals,
} = require('../utils/constants.js');

const {cEth, cErc20, underlying, comptroller, priceFeed} = require('../utils/contracts.js');

// 요청받은 cToken 마켓 진입
const enterMarket = async (req, res) => {
    let { cTokenAddress } = req.body;
    checkAddress(cTokenAddress);
    let markets = [cTokenAddress];
    try {
        const txSigner = comptroller.connect(wallet);
        let enterMarkets = await txSigner.getFunction("enterMarkets").send(markets);
        console.log(enterMarkets);
        res.status(200).json({ message: 'enter the market successfully', enterMarkets});
    } catch (error) {
        console.error('Error executing enterMarkets function:', error);
        res.status(500).json({ error: 'Failed to execute contract function' });
    }
};

// req.body로 받은 지갑 주소의 유동성을 로그
const getMyLiquidity = async (req, res) => {
    // const { walletAddress } = req.body;
    // checkAddress(walletAddress);
    const walletAddress = myWalletAddress;
    try {
        let {1:liquidity} = await comptroller.getAccountLiquidity(walletAddress);
        liquidity = Number(liquidity / ethDecimals);
        const message = `the account(${walletAddress}) has ${liquidity} of LIQUID assets (worth of USD) pooled in the protocol.`;
        res.status(200).json({ message: message });
        console.log(message);
    } catch (error) {
        console.error('Error executing get liquidity function:', error);
        res.status(500).json({ error: 'Failed to execute get liquidity function' });
    }
};

// req.body로 받은 지갑 주소의 collateralFactor을 로그
const getMyCollateralFactor = async (req, res) => {
    const {cTokenAddress} = req.body;
    // const { walletAddress } = req.body;
    // checkAddress(walletAddress);
    
    try {
        let {1:collateralFactor} = await comptroller.markets(cTokenAddress);
        collateralFactor = Number(collateralFactor / ethDecimals)/100 ;
        const message = `can borrow up to ${collateralFactor}% of your TOTAL collateral`;
        res.status(200).json({ message: message });
        console.log(message);
    } catch (error) {
        console.error('Error executing get collateralFactor function:', error);
        res.status(500).json({ error: 'Failed to execute get collateralFactor function' });
    }
};

// 조회 하고자하는 자산의 현재 시세를 USD 단위로 출력
const getPrice = async (req, res) => {
    const { assetSymbol } = req.body;
    try {
        let underlyingPriceInUsd = await priceFeed.price(assetSymbol);
        underlyingPriceInUsd = underlyingPriceInUsd / 1e6; // Price feed provides price in USD with 6 decimal places
        const message = `1 ${assetName} == ${underlyingPriceInUsd.toFixed(6)} USD`;
        res.status(200).json({ message: message });
        console.log(message);
    } catch (error) {
        console.error('Error executing get price function:', error);
        res.status(500).json({ error: 'Failed to execute get price function' });
    }
};


// Eth의 borrow rate 반환
const getEthBorrowRate = async (req, res) => {
    try {
        let borrowRate = await cEth.borrowRatePerBlock();
        borrowRate = borrowRate / ethDecimals
        const message = `\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) ETH per block.\nThis is based on the current borrow rate.`;
        res.status(200).json({ message: message });
        console.log(message);
    } catch (error) {
        console.error('Error executing get borrowRate function:', error);
        res.status(500).json({ error: 'Failed to execute get borrowRate function' });
    }
};

// Eth의 borrow rate 반환
const getErc20BorrowRate = async (req, res) => {
    try {
        let borrowRate = await cErc20.borrowRatePerBlock();
        borrowRate = borrowRate / ethDecimals;
        const message = `\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) ${assetName} per block.\nThis is based on the current borrow rate.`;
        res.status(200).json({ message: message });
        console.log(message);
    } catch (error) {
        console.error('Error executing get borrowRate function:', error);
        res.status(500).json({ error: 'Failed to execute get borrowRate function' });
    }
};

// 빌린 ETH양 반환
const getEthBorrowBalance = async (req, res) => {
    // const { walletAddress } = req.body;
    // checkAddress(walletAddress);
    const walletAddress = myWalletAddress;
    try {
        let balance = await cEth.borrowBalanceCurrent(walletAddress);
        balance = balance / ethDecimals;
        const message = `Borrow balance is ${balance} ETH`;
        res.status(200).json({ message: message });
        console.log(message);
    } catch (error) {
        console.error('Error executing get borrowBalance function:', error);
        res.status(500).json({ error: 'Failed to execute get borrowBalance function' });
    }
};

// 빌린 Erc20양 반환
const getErc20BorrowBalance = async (req, res) => {
    // const { walletAddress } = req.body;
    // checkAddress(walletAddress);
    const walletAddress = myWalletAddress;
    try {
        let balance = await cErc20.borrowBalanceCurrent(walletAddress);
        balance = balance / ethDecimals;
        const message = `Borrow balance is ${balance} ${assetName}`;
        res.status(200).json({ message: message });
        console.log(message);
    } catch (error) {
        console.error('Error executing get borrowBalance function:', error);
        res.status(500).json({ error: 'Failed to execute get borrowBalance function' });
    }
};


// 이더 대출 (borrowAmount는 이더 단위)
const borrowEth = async (req, res) => {
  let { borrowAmount } = req.body;
  // 입력값 확인
  checkInput(borrowAmount);

    try {
        console.log(`Trying to borrow ${borrowAmount} ETH`);
        const txSigner = cEth.connect(wallet);
        let borrow = await txSigner.getFunction("borrow").send(BigInt(borrowAmount));
        const borrowResult = await borrow.wait(1);
        if (isNaN(borrowResult)) {
            const message = `${borrowAmount} ETH borrow successful.`
            console.log(message);
            res.status(200).json({ message: message });
        } else {
            throw new Error(
                `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
                `Code: ${borrowResult}\n`
            );
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(error.message);
    }
};

// ERC20 대출 (borrowAmount는 토큰 단위)
const borrowErc20 = async (req, res) => {
    let { borrowAmount } = req.body;
    // 입력값 확인
    checkInput(borrowAmount);
  
    try {
        console.log(`Trying to borrow ${borrowAmount} ${assetName}`);
        const txSigner = cToken.connect(wallet);
        let borrow = await txSigner.getFunction("borrow").send(BigInt(borrowAmount)*ethDecimals);
        const borrowResult = await borrow.wait(1);
        if (isNaN(borrowResult)) {
            const message = `${borrowAmount} ${assetName} borrow successful.`
            console.log(message);
            res.status(200).json({ message: message });
        } else {
            throw new Error(
                `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
                `Code: ${borrowResult}\n`
            );
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(error.message);
    }
};

// 빌린 이더 상환 (repayAmount는 이더 단위)
const repayEth = async (req, res) => {
    let { repayAmount } = req.body;
    // 입력값 확인
    checkInput(repayAmount);
  
    try {
        console.log(`Trying to repay ${repayAmount} ETH`);
        const txSigner = cEth.connect(wallet);
        let repay = await txSigner.getFunction("repayBorrow").send(BigInt(repayAmount)*ethDecimals);
        const repayResult = await borrow.wait(1);
        const failure = repayResult.events.find(_ => _.event === 'Failure');
        if (!failure) {
            const message = `${repayAmount} ETH repay successful.`
            console.log(message);
            res.status(200).json({ message: message });
        } else {
                const errorCode = failure.args.error;
                throw new Error(`repayBorrow error, code ${errorCode}`);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(error.message);
    }
};

// 빌린 이더 상환 (repayAmount는 이더 단위)
const repayErc20 = async (req, res) => {
    let { repayAmount } = req.body;
    // 입력값 확인
    checkInput(repayAmount);
    try {
        // cTokenContract가 ERC20 토큰 가져갈 수 있게 승인부터 선행
        const txSigner = underlying.connect(wallet);
        let approve = await txSigner.getFunction("approve").send(cTokenContractAddress, BigInt(repayAmount * ethDecimals));
        await approve.wait(1);
        try {
            console.log(`Trying to repay ${repayAmount} ETH`);
            const txSigner = cErc20.connect(wallet);
            let repay = await txSigner.getFunction("repayBorrow").send(BigInt(repayAmount)*ethDecimals);
            const repayResult = await repay.wait(1);
            const failure = repayResult.events.find(_ => _.event === 'Failure');
            if (!failure) {
                const message = `${repayAmount} ${assetName} repay successful.`
                console.log(message);
                res.status(200).json({ message: message });
            } else {
                    const errorCode = failure.args.error;
                    throw new Error(`repayBorrow error, code ${errorCode}`);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
            console.error(error.message);
        }
      } catch (error) {
        res.status(402).json({ error: "can't approve ERC20 token" });
        console.error(error.message);
    }
};

module.exports = { 
    enterMarket, 
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
    repayErc20, 
};
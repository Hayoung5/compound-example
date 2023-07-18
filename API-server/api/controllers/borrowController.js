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
  cTokenContractAddress,
} = require('../utils/constants.js');

const {cEth, cErc20, underlying, comptroller, priceFeed} = require('../utils/contracts.js');

const ethDecimals = 18; // Ethereum has 18 decimal places
let assetName, daiDecimals, cDaiDecimals, cEthDecimals;

(async()=> {
  assetName = await underlying.symbol(); // DAI
  daiDecimals = await underlying.decimals();
  cDaiDecimals = await cErc20.decimals();
  cEthDecimals = await cEth.decimals();
})();

// 요청받은 cToken 마켓 진입
const enterMarket = async (req, res) => {
    let { cTokenAddress } = req.body;
    if (!checkAddress(cTokenAddress)) {
        return res.status(400).json({ error: '올바른 이더리움 주소값이 아닙니다' });
    }
    let markets = [cTokenAddress];
    try {
        const txSigner = comptroller.connect(wallet);
        let enterMarkets = await txSigner.getFunction("enterMarkets").send(markets);
        console.log(enterMarkets);
        res.status(200).json({ message: 'enter the market successfully', enterMarkets});
    } catch (error) {
        console.error('Error executing enterMarkets function:', error);
        res.status(500).json({ error: 'Failed to execute enter market function' });
    }
};

// req.body로 받은 지갑 주소의 유동성을 로그
const getMyLiquidity = async (req, res) => {
    // const { walletAddress } = req.body;
    // checkAddress(walletAddress);
    console.log("get liquidity");
    const walletAddress = myWalletAddress;
    try {
        let {1:liquidity} = await comptroller.getAccountLiquidity(walletAddress);
        liquidity = ethers.formatUnits(liquidity, ethDecimals);
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
    if (!checkAddress(cTokenAddress)) {
        return res.status(400).json({ error: '올바른 이더리움 주소값이 아닙니다' });
    }
    
    try {
        let {1:collateralFactor} = await comptroller.markets(cTokenAddress);
        collateralFactor = ethers.formatUnits(collateralFactor, ethDecimals) * 100 ;
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
        underlyingPriceInUsd = ethers.toNumber(underlyingPriceInUsd) / 1e6; // Price feed provides price in USD with 6 decimal places
        const message = `1 ${assetName} == ${underlyingPriceInUsd} USD`;
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
        borrowRate = ethers.formatUnits(borrowRate, ethDecimals);
        const message = `Your borrowed amount INCREASES (${borrowRate} * borrowed amount) ETH per block. \n This is based on the current borrow rate.`;
        res.status(200).json({ message: message });
        console.log(message);
    } catch (error) {
        console.error('Error executing get borrowRate function:', error);
        res.status(500).json({ error: 'Failed to execute get borrowRate function' });
    }
};

// Dai의 borrow rate 반환
const getErc20BorrowRate = async (req, res) => {
    try {
        let borrowRate = await cErc20.borrowRatePerBlock();
        borrowRate =ethers.formatUnits(borrowRate, daiDecimals);
        const message = `Your borrowed amount INCREASES (${borrowRate} * borrowed amount) ${assetName} per block. This is based on the current borrow rate.`;
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
        let balance = await cEth.borrowBalanceCurrent.staticCall(walletAddress);
        balance = ethers.formatUnits(balance, ethDecimals);
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
        let balance = await cErc20.borrowBalanceCurrent.staticCall(walletAddress);
        balance = ethers.formatUnits(balance, daiDecimals);
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
    
    try {
        console.log(`Trying to borrow ${borrowAmount} ETH`);
        const txSigner = cEth.connect(wallet);
        let borrow = await txSigner.getFunction("borrow").send(ethers.parseEther(String(borrowAmount)));
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
    const unScaledAmount = borrowAmount;
    // 입력값 확인
    borrowAmount = checkInput(borrowAmount, daiDecimals);
    if (!borrowAmount) {
        return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
    }
  
    try {
        console.log(`Trying to borrow ${borrowAmount} ${assetName}`);
        const txSigner = cErc20.connect(wallet);
        let borrow = await txSigner.getFunction("borrow").send(borrowAmount);
        const borrowResult = await borrow.wait(1);
        if (isNaN(borrowResult)) {
            const message = `${unScaledAmount} ${assetName} borrow successful.`
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
    const unScaledAmount = repayAmount;
    // 입력값 확인
  
    try {
        console.log(`Trying to repay ${unScaledAmount} ETH`);
        const txSigner = cEth.connect(wallet);
        let repay = await txSigner.getFunction("repayBorrow").send({
            value: ethers.toBeHex(ethers.parseEther(String(repayAmount)))
        });
        const repayResult = await repay.wait(1);
        if (isNaN(repayResult)) {
            const message = `${unScaledAmount} ETH repay successful.`
            console.log(message);
            res.status(200).json({ message: message });
        } else {
            throw new Error(
                `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
                `Code: ${repayResult}\n`
            );
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(error.message);
    }
};

// 빌린 DAI 상환 (repayAmount는 DAI 단위)
const repayErc20 = async (req, res) => {
    let { repayAmount } = req.body;
    const unScaledAmount = repayAmount;
    // 입력값 확인
    repayAmount = checkInput(repayAmount, daiDecimals);
    if (!repayAmount) {
        return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
    }

    try {
        // cTokenContract가 ERC20 토큰 가져갈 수 있게 승인부터 선행
        const txSigner = underlying.connect(wallet);
        let approve = await txSigner.getFunction("approve").send(cTokenContractAddress, repayAmount);
        await approve.wait(1);
        try {
            console.log(`Trying to repay ${unScaledAmount} ${assetName}`);
            const txSigner = cErc20.connect(wallet);
            let repay = await txSigner.getFunction("repayBorrow").send(String(repayAmount));
            const repayResult = await repay.wait(1);
            if (isNaN(repayResult)) {
                const message = `${unScaledAmount} ${assetName} repay successful.`
                console.log(message);
                res.status(200).json({ message: message });
            } else {
                throw new Error(
                    `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
                    `Code: ${repayResult}\n`
                );
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
const dotenv = require("dotenv");
dotenv.config();

// controller using direct rpc call with ehter js
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.JSON_PRC_URL);
// Your Ethereum wallet private key
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const myWalletAddress = wallet.address;
const { checkInput } = require('../utils/helper.js');

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

// 서버에 연결되어있는 지갑 계정의 ETH, cETH, DAI 자산을 로그
const getMyBalance = async (req, res) => {
  try {
    console.log(`get My wallet's balances`);
    let myWalletEthBalance = await provider.getBalance(myWalletAddress) / ethDecimals;
    let myWalletCEthBalance = await cEth.balanceOf(myWalletAddress) / cEthDecimals;
    let myWalletUnderlyingBalance = await underlying.balanceOf(myWalletAddress) / ethDecimals;
    result = { ETH_Balance: ethers.toNumber(myWalletEthBalance), 
              cETH_Balance: ethers.toNumber(myWalletCEthBalance), 
              DAI_Balance: ethers.toNumber(myWalletUnderlyingBalance)
            };
    console.log(result);
    res.status(200).json({ message: 'get my balance successfully', result});
  } catch (error) {
    console.error('Error executing contract function:', error);
    res.status(500).json({ error: 'Failed to execute contract function' });
  }
};

// req.body로 받은 지갑 주소의 ETH, cETH, DAI 자산을 로그
const getBalance = async (req, res) => {
  const { walletAddress } = req.body;

  try {
    ethers.utils.getAddress(address);
  } catch (error) {
    return res.status(400).json({ error: '올바른 이더리움 주소값이 아닙니다' });
  }

  try {
    console.log(`get balances of wallet address : ${walletAddress}`);
    let walletEthBalance = await provider.getBalance(walletAddress) / ethDecimals;
    let walletCEthBalance = await cEth.balanceOf(walletAddress) / BigInt(1e8);
    let walletUnderlyingBalance = await underlying.balanceOf(walletAddress) / ethDecimals;
    result = { ETH_Balance: ethers.toNumber(walletEthBalance), 
              cETH_Balance: ethers.toNumber(walletCEthBalance), 
              DAI_Balance: ethers.toNumber(walletUnderlyingBalance)
            };
    console.log(result);
    res.status(200).json({ message: `get balance of ${walletAddress} successfully`, result });
  } catch (error) {
    console.error('Error executing get balance function:', error);
    res.status(500).json({ error: 'Failed to execute get balance function' });
  }

};

// 이더 예치 (supplyAmount는 이더 단위)
const supplyEth = async (req, res) => {
  let { supplyAmount } = req.body;
  // 입력값 확인
  checkInput(supplyAmount);

  try {
    // 잔고 확인
    let walletEthBalance = await provider.getBalance(myWalletAddress) / ethDecimals;
    console.log(`wallet > supply amount ? ${walletEthBalance > supplyAmount}`);
    if (walletEthBalance <= supplyAmount) {
      throw new Error(`insufficient ETH, my wallet balance : ${walletEthBalance}, supply amount you requested : ${supplyAmount}`);
    } else {
      // 예치
      try {
        console.log("start to supply",supplyAmount);
        const txSigner = cEth.connect(wallet);
        let mint = await txSigner.getFunction("mint").send({
          from : myWalletAddress,
          gasPrice: ethers.toBeHex(BigInt(20000000000)), // use ethgasstation.info (mainnet only)
          value: ethers.toBeHex(BigInt(supplyAmount * ethDecimals))
        })
        await mint.wait(1);
        console.log(`supply ${supplyAmount} ETH sucessfully`);
        res.status(200).json({ message: `supply ${supplyAmount} ETH sucessfully`, mint });
      } catch (error) {
        console.error('Error executing supply ETH function:', error);
        res.status(500).json({ error: 'Failed to execute supply ETH function' });
      }
    }
  } catch (error) {
    res.status(402).json({ error: error.message });
    console.error(error.message);
  }
};

// ERC20 예치 (supplyAmount는 다이 단위)
const supplyErc20 = async (req, res) => {
  let { supplyAmount } = req.body;
  // 입력값 확인
  checkInput(supplyAmount);

  try {
    // 잔고 확인
    const txSigner = underlying.connect(wallet);
    let approve = await txSigner.getFunction("approve").send(cTokenContractAddress, BigInt(supplyAmount * ethDecimals));
    await approve.wait(1);
    try {
      console.log("start to supply",supplyAmount);
      const txSigner = cErc20.connect(wallet);
      let mint = await txSigner.getFunction("mint").send(BigInt(supplyAmount * ethDecimals));
      await mint.wait(1);
      console.log(`supply ${supplyAmount} ${assetName} sucessfully`);
      res.status(200).json({ message: `supply ${supplyAmount} ${assetName} sucessfully`, mint });
    } catch (error) {
      console.error(`Error executing supply ${assetName} function:`, error);
      res.status(500).json({ error: `Error executing supply ${assetName} function` });
    }
  } catch (error) {
    res.status(402).json({ error: "can't approve ERC20 token" });
    console.error(error.message);
  }
};

// cToken <-> ERC20  교환 비율 반환
const getCErc20ExchangeRate = async (req, res) => {
  try {
    // 잔고 확인
    let erCurrent = await cTokenContract.exchangeRateCurrent();
    let exchangeRate = +erCurrent * ethDecimals * ethDecimals/ cEthDecimals;
    let message = `Current exchange rate from c${assetName} to ${assetName}: ${exchangeRate}`;
    console.log(message);
    res.status(200).json({ message: message});
  } catch (error) {
    res.status(500).json({ error: 'Failed to call exchangeRateCurrent function' });
    console.error(error.message);
  }
};

// cETH <-> ETH  교환 비율 반환
const getCEthExchangeRate = async (req, res) => {
  try {
    // 잔고 확인
    let erCurrent = await cEth.exchangeRateCurrent();
    let exchangeRate = +erCurrent * ethDecimals * ethDecimals/ cEthDecimals;
    let message = `Current exchange rate from cETH to Eth: ${exchangeRate}`;
    console.log(message);
    res.status(200).json({ message: message});
  } catch (error) {
    res.status(500).json({ error: 'Failed to call exchangeRateCurrent function' });
    console.error(error.message);
  }
};

// cETH를 상환함으로써 예치했던 자산 반환 받음
const redeemCEth = async (req, res) => {
  let { redeemAmount } = req.body;
  // 입력값 확인
  checkInput(supplyAmount);

  try {
    // cETH redeem
    const txSigner = cEth.connect(wallet);
    let redeem = await txSigner.getFunction("redeem").send(
      ethers.toBeHex(BigInt(redeemAmount * cEthDecimals)),
      {
        from : myWalletAddress,
        gasPrice: ethers.toBeHex(BigInt(20000000000)),
      })
    await redeem.wait(1);
    console.log(`redeem ${redeemAmount} cETH sucessfully`);
    res.status(200).json({ message: `redeem ${redeemAmount} cETH sucessfully`, redeem });

  } catch (error) {
    res.status(402).json({ error: error.message });
    console.error(error.message);
  }
};

// 반환받을 Underlying 자산기준으로 cETH를 상환함으로써 예치했던 자산 반환
const redeemCEthBasedUnderlying = async (req, res) => {
  let { redeemAmount } = req.body;
  // 입력값 확인
  checkInput(supplyAmount);

  try {
    // cETH redeem
    const txSigner = cEth.connect(wallet);
    let redeem = await txSigner.getFunction("redeemUnderlying").send(
      ethers.toBeHex(BigInt(redeemAmount * cEthDecimals)),
      {
        from : myWalletAddress,
        gasPrice: ethers.toBeHex(BigInt(20000000000)),
      })
    await redeem.wait(1);
    console.log(`redeem cETH based on ${redeemAmount} ETH sucessfully`);
    res.status(200).json({ message: `redeem cETH based on ${redeemAmount} ETH sucessfully`, redeem });

  } catch (error) {
    res.status(402).json({ error: error.message });
    console.error(error.message);
  }
};

// cErc20을 상환함으로써 예치했던 자산 반환 받음
const redeemCErc20 = async (req, res) => {
  let { redeemAmount } = req.body;
  // 입력값 확인
  checkInput(supplyAmount);

  try {
    // cETH redeem
    const txSigner = cTokenContract.connect(wallet);
    let redeem = await txSigner.getFunction("redeem").send(
      ethers.toBeHex(BigInt(redeemAmount * cEthDecimals)),
      {
        from : myWalletAddress,
        gasPrice: ethers.toBeHex(BigInt(20000000000)),
      })
    await redeem.wait(1);
    console.log(`redeem ${redeemAmount} c${assetName} sucessfully`);
    res.status(200).json({ message: `redeem ${redeemAmount} c${assetName} sucessfully`, redeem });

  } catch (error) {
    res.status(402).json({ error: error.message });
    console.error(error.message);
  }
};

// cErc20을 상환함으로써 예치했던 자산 반환 받음
const redeemCErc20BasedUnderlying = async (req, res) => {
  let { redeemAmount } = req.body;
  // 입력값 확인
  checkInput(supplyAmount);

  try {
    // cETH redeem
    const txSigner = cTokenContract.connect(wallet);
    let redeem = await txSigner.getFunction("redeemUnderlying").send(
      ethers.toBeHex(BigInt(redeemAmount * cEthDecimals)),
      {
        from : myWalletAddress,
        gasPrice: ethers.toBeHex(BigInt(20000000000)),
      })
    await redeem.wait(1);
    console.log(`redeem c${assetName} based on ${redeemAmount} ${assetName} sucessfully`);
    res.status(200).json({ message: `redeem c${assetName} based on ${redeemAmount} ${assetName} sucessfully`, redeem });

  } catch (error) {
    res.status(402).json({ error: error.message });
    console.error(error.message);
  }
};

module.exports = { 
  getMyBalance, 
  getBalance,
  supplyEth, 
  supplyErc20, 
  redeemCEth, 
  redeemCEthBasedUnderlying, 
  redeemCErc20, 
  redeemCErc20BasedUnderlying,
  getCErc20ExchangeRate,
  getCEthExchangeRate,
};
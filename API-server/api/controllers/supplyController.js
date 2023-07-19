const dotenv = require("dotenv");
dotenv.config();

// controller using direct rpc call with ehter js
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.JSON_PRC_URL);
// Your Ethereum wallet private key
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const myWalletAddress = wallet.address;
const { checkAddress, checkInput } = require('../utils/helper.js');

const {
  cTokenContractAddress,
} = require('../utils/constants.js');

const {cEth, cErc20, underlying } = require('../utils/contracts.js');

const ethDecimals = 18; // Ethereum has 18 decimal places
let assetName, daiDecimals, cDaiDecimals, cEthDecimals;

(async()=> {
  assetName = await underlying.symbol(); // DAI
  daiDecimals = await underlying.decimals();
  cDaiDecimals = await cErc20.decimals();
  cEthDecimals = await cEth.decimals();
})();

// 서버에 연결되어있는 지갑 계정의 ETH, cETH, DAI 자산을 로그
const getMyBalance = async (req, res) => {
  try {
    console.log(`get My wallet's balances`);
    let myWalletEthBalance = await provider.getBalance(myWalletAddress);
    let myWalletCEthBalance = await cEth.balanceOf(myWalletAddress);
    let myWalletUnderlyingBalance = await underlying.balanceOf(myWalletAddress);
    let myWalletCErc20Balance = await cErc20.balanceOf(myWalletAddress);
    result = { ETH_Balance: ethers.formatUnits(myWalletEthBalance, ethDecimals),
              cETH_Balance: ethers.formatUnits(myWalletCEthBalance, cEthDecimals),
              DAI_Balance: ethers.formatUnits(myWalletUnderlyingBalance, daiDecimals),
              cDAI_Balance: ethers.formatUnits(myWalletCErc20Balance, cDaiDecimals)
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

  if (!checkAddress(walletAddress)) {
    return res.status(400).json({ error: '올바른 이더리움 주소값이 아닙니다' });
  }

  try {
    console.log(`get balances of wallet address : ${walletAddress}`);
    let walletEthBalance = await provider.getBalance(walletAddress);
    let walletCEthBalance = await cEth.balanceOf(walletAddress);
    let walletUnderlyingBalance = await underlying.balanceOf(walletAddress);
    let walletCErc20Balance = await cErc20.balanceOf(walletAddress);
    result = { ETH_Balance: ethers.formatUnits(walletEthBalance, ethDecimals),
              cETH_Balance: ethers.formatUnits(walletCEthBalance, cEthDecimals),
              DAI_Balance: ethers.formatUnits(walletUnderlyingBalance, daiDecimals),
              cDAI_Balance: ethers.formatUnits(walletCErc20Balance, cDaiDecimals)
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
  const unScaledAmount = supplyAmount;
  // 입력값 확인
  supplyAmount = checkInput(supplyAmount, ethDecimals);
  if (!supplyAmount) {
    return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
  }

  try {
    // 잔고 확인
    let walletEthBalance = await provider.getBalance(myWalletAddress);
    console.log(`wallet > supply amount ? ${walletEthBalance > supplyAmount}`);
    if (walletEthBalance <= supplyAmount) {
      throw new Error(`insufficient ETH, my wallet balance : ${walletEthBalance}, supply amount you requested : ${unScaledAmount}`);
    } else {
      // 예치
      try {
        console.log(`start to supply ${unScaledAmount} ETH`);
        const txSigner = cEth.connect(wallet);
        let mint = await txSigner.getFunction("mint").send({
          from : myWalletAddress,
          gasPrice: ethers.toBeHex(BigInt(20000000000)), // 실제 가스비 처리는 더 복잡
          value: ethers.toBeHex(supplyAmount)
        })
        await mint.wait(1);
        console.log(`supply ${unScaledAmount} ETH successfully`);
        res.status(200).json({ message: `supply ${unScaledAmount} ETH successfully`, mint });
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
  const unScaledAmount = supplyAmount;
  // 입력값 확인
  supplyAmount = checkInput(supplyAmount, daiDecimals);
  if (!supplyAmount) {
    return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
  }

  try {
    // 잔고 확인
    const txSigner = underlying.connect(wallet);
    let approve = await txSigner.getFunction("approve").send(cTokenContractAddress, ethers.toBeHex(supplyAmount));
    await approve.wait(1);
    try {
      console.log(`start to supply ${unScaledAmount} ${assetName}`);
      const txSigner = cErc20.connect(wallet);
      let mint = await txSigner.getFunction("mint").send(supplyAmount);
      await mint.wait(1);
      console.log(`supply ${unScaledAmount} ${assetName} successfully`);
      res.status(200).json({ message: `supply ${unScaledAmount} ${assetName} successfully`, mint });
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
    const erCurrent = await cErc20.exchangeRateCurrent.staticCall();
    // rate / 10^(18 + EthDecimals - cEthDecimals)
    let exchangeRate = ethers.toNumber(erCurrent / BigInt(10**20));
    exchangeRate /= Math.pow(10,8);
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
    let erCurrent = await cEth.exchangeRateCurrent.staticCall();
    // rate / 10^(18 + EthDecimals - cEthDecimals)
    let exchangeRate = ethers.toNumber(erCurrent / BigInt(10**20));
    exchangeRate /= Math.pow(10,8);
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
  const unScaledAmount = redeemAmount;
  // 입력값 확인
  redeemAmount = checkInput(redeemAmount, cEthDecimals);
  if (!redeemAmount) {
    return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
  }

  try {
    // cETH redeem
    const txSigner = cEth.connect(wallet);
    let redeem = await txSigner.getFunction("redeem").send(
      ethers.toBeHex(redeemAmount),
      {
        from : myWalletAddress,
        gasPrice: ethers.toBeHex(BigInt(20000000000)),
      })
    await redeem.wait(1);
    console.log(`redeem ${unScaledAmount} cETH successfully`);
    res.status(200).json({ message: `redeem ${unScaledAmount} cETH successfully`, redeem });

  } catch (error) {
    res.status(402).json({ error: error.message });
    console.error(error.message);
  }
};

// 반환받을 Underlying 자산기준으로 cETH를 상환함으로써 예치했던 자산 반환
const redeemCEthBasedUnderlying = async (req, res) => {
  let { redeemAmount } = req.body;
  const unScaledAmount = redeemAmount;
  // 입력값 확인
  redeemAmount = checkInput(redeemAmount, ethDecimals);
  if (!redeemAmount) {
    return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
  }

  try {
    // cETH redeem
    const txSigner = cEth.connect(wallet);
    let redeem = await txSigner.getFunction("redeemUnderlying").send(
      ethers.toBeHex(redeemAmount),
      {
        from : myWalletAddress,
        gasPrice: ethers.toBeHex(BigInt(20000000000)),
      })
    await redeem.wait(1);
    console.log(`redeem cETH based on ${unScaledAmount} ETH successfully`);
    res.status(200).json({ message: `redeem cETH based on ${unScaledAmount} ETH successfully`, redeem });

  } catch (error) {
    res.status(402).json({ error: error.message });
    console.error(error.message);
  }
};

// cErc20을 상환함으로써 예치했던 자산 반환 받음
const redeemCErc20 = async (req, res) => {
  let { redeemAmount } = req.body;
  const unScaledAmount = redeemAmount;
  // 입력값 확인
  redeemAmount = checkInput(redeemAmount, cDaiDecimals);
  if (!redeemAmount) {
    return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
  }

  try {
    // cETH redeem
    const txSigner = cErc20.connect(wallet);
    let redeem = await txSigner.getFunction("redeem").send(
      ethers.toBeHex(redeemAmount),
      {
        from : myWalletAddress,
        gasPrice: ethers.toBeHex(BigInt(20000000000)),
      })
    await redeem.wait(1);
    console.log(`redeem ${unScaledAmount} c${assetName} successfully`);
    res.status(200).json({ message: `redeem ${unScaledAmount} c${assetName} successfully`, redeem });

  } catch (error) {
    res.status(402).json({ error: error.message });
    console.error(error.message);
  }
};

// 환받을 Underlying 자산기준으로 cERC20를 상환함으로써 예치했던 자산 반환
const redeemCErc20BasedUnderlying = async (req, res) => {
  let { redeemAmount } = req.body;
  const unScaledAmount = redeemAmount;
  // 입력값 확인
  redeemAmount = checkInput(redeemAmount, daiDecimals);
  if (!redeemAmount) {
    return res.status(400).json({ error: '올바른 형식의 입력값이 아닙니다' });
  }

  try {
    // cETH redeem
    const txSigner = cErc20.connect(wallet);
    let redeem = await txSigner.getFunction("redeemUnderlying").send(
      ethers.toBeHex(redeemAmount),
      {
        from : myWalletAddress,
        gasPrice: ethers.toBeHex(BigInt(20000000000)),
      })
    await redeem.wait(1);
    console.log(`redeem c${assetName} based on ${unScaledAmount} ${assetName} successfully`);
    res.status(200).json({ message: `redeem c${assetName} based on ${unScaledAmount} ${assetName} successfully`, redeem });

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
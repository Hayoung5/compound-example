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
  cEthAbi,
  comptrollerAbi,
  priceFeedAbi,
  cErcAbi,
  erc20Abi,
} = require('../../contracts.json');

const {
  cEthContractAddress,
  cTokenContractAddress,
  underlyingContractAddress,
  comptrollerAddress,
  priceFeedAddress
} = require('../utils/constants.js');



const cEth = new ethers.Contract(cEthContractAddress, cEthAbi, provider);
const cErc20 = new ethers.Contract(cTokenContractAddress, cErcAbi, provider);
const underlying = new ethers.Contract(underlyingContractAddress, erc20Abi, provider);
const comptroller = new ethers.Contract(comptrollerAddress, comptrollerAbi, provider);
const priceFeed = new ethers.Contract(priceFeedAddress, priceFeedAbi, provider);

const assetName = 'DAI';
const ethDecimals = BigInt(1e18); // Ethereum has 18 decimal places
const cEthDecimals = BigInt(1e8); // cETG has 8 decimal places

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
  try {
    supplyAmount = Number(supplyAmount)
    supplyAmount = supplyAmount * Math.pow(10, underlyingDecimals);
    supplyAmount = supplyAmount.toString();
  } catch {
    return res.status(400).json({ error: '올바른 형식의 이더 예치 수량이 아닙니다' });
  }

  try {
    const approve = await underlying.approve(cTokenContractAddress, supplyAmount);
    await approve.wait(1);
  } catch {
    console.log('Error executing approve function', error);
    return res.status(500).json({ error: 'Error executing approve function' });
  }
  
  try {
    let mint = await cToken.mint(underlyingAsCollateral);
    const mintResult = await mint.wait(1);
    res.status(200).json({ message: `supply ${supplyAmount} ETH sucessfully`, mint });
  } catch {
    console.error('Error executing supply ERC20 function:', error);
    res.status(500).json({ error: 'Failed to execute supply ERC20 function' });
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

module.exports = { getMyBalance, getBalance, supplyEth, redeemCEth };
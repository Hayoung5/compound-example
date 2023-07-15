const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.JSON_PRC_URL);
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
    priceFeedAddress,
    } = require('./constants.js');
  
const cEth = new ethers.Contract(cEthContractAddress, cEthAbi, provider);
const cErc20 = new ethers.Contract(cTokenContractAddress, cErcAbi, provider);
const underlying = new ethers.Contract(underlyingContractAddress, erc20Abi, provider);
const comptroller = new ethers.Contract(comptrollerAddress, comptrollerAbi, provider);
const priceFeed = new ethers.Contract(priceFeedAddress, priceFeedAbi, provider);


module.exports = {cEth, cErc20, underlying, comptroller, priceFeed};

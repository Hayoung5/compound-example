require('dotenv').config();
const hre = require('hardhat');
const { TASK_NODE_CREATE_SERVER } = require('hardhat/builtin-tasks/task-names');
const { ethers, network } = require("hardhat");
// const ethers = require('hardhat');
const jsonRpcUrl = process.env.JSON_RPC_URL;

// set amount of tokens to seed in the 0th account on localhost
// You can do the same thing with any high-balance Ethereum account (whales)
const {
  erc20Abi,
} = require('../contracts.json');

const seedTokenInfo = {
  "dai" : {
    amount : 100,
    decimal : 18,
    address : '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    abi : erc20Abi
  },
};

// Set up localhost fork with Hardhat
(async function () {
  console.log(`\nRunning a hardhat localhost fork of mainnet at ${jsonRpcUrl}\n`);

  const jsonRpcServer = await hre.run(TASK_NODE_CREATE_SERVER, {
    hostname: 'localhost',
    port: parseInt(process.env.PORT),
    provider: network.provider,
  });

  await jsonRpcServer.listen();

  // Seed first account with ERC-20 tokens on localhost
  const assetsToSeed = Object.keys(seedTokenInfo);
  const seedRequests = [];
  assetsToSeed.forEach((asset) => { seedRequests.push(seed(asset)) });
  await Promise.all(seedRequests);
  console.log('\nReady to test locally! To exit, hold Ctrl+C.\n');
})().catch(console.error)


// Moves tokens from cToken contracts to the localhost address
// but this will work with any Ethereum address with a lot of tokens
async function seed(asset) {
  const tokenAddress = seedTokenInfo[asset].address;
  const tokenAbi = seedTokenInfo[asset].abi;
  const amount = seedTokenInfo[asset].amount;
  const decimal = seedTokenInfo[asset].decimal;

  const provider = new ethers.JsonRpcProvider(jsonRpcUrl);
  const accounts = await provider.listAccounts();

  // Impersonate this address (only works in local testnet)
  console.log('Impersonating address on localhost... ', tokenAddress);
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [ tokenAddress ],
  });

  // Number of underlying tokens to mint, scaled up so it is an integer
  //const numbTokensToSeed =  ethers.parseUnits(amount, decimal); // 전송할 토큰의 양 (단위에 주의해야 함)
  const numbTokensToSeed = BigInt(amount*Math.pow(10, decimal));
  const signer = await ethers.getSigner(tokenAddress);
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

  const transferTrx = await tokenContract.transfer(accounts[0], numbTokensToSeed);
  await transferTrx.wait(1);

  console.log('Local test account successfully seeded with ' + asset);

  const balanceOf = await tokenContract.balanceOf(accounts[0]) / BigInt(Math.pow(10, decimal));
  
  const tokens = ethers.toNumber(balanceOf);
  console.log(`${asset} amount in first localhost account wallet ${accounts[0].address}:\n ${tokens}`);
}
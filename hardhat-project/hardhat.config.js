require('@nomicfoundation/hardhat-ethers');
const ethers = require('ethers');

const providerUrl = process.env.ETHEREUM_PROVIDER_URL;
const developmentMnemonic = process.env.MNEMONIC;

if (!providerUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `MAINNET_PROVIDER_URL`\n');
  process.exit(1);
}

if (!developmentMnemonic) {
  console.error('Missing development Ethereum account mnemonic as environment variable `DEV_ETH_MNEMONIC`\n');
  process.exit(1);
}

function getPrivateKeysFromMnemonic(mnemonic, numberOfPrivateKeys = 20) {
  const result = [];
  for (let i = 0; i < numberOfPrivateKeys; i++) {
    const mnemo = ethers.ethers.Mnemonic.fromPhrase(mnemonic);
    result.push(ethers.HDNodeWallet.fromMnemonic(mnemo, `m/44'/60'/0'/0/${i}`).privateKey);
  }
}


module.exports = {
  solidity: {
    version: '0.8.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: providerUrl,
      },
      gasPrice: 0,
      initialBaseFeePerGas: 0,
      loggingEnabled: false,
      accounts: {
        mnemonic: developmentMnemonic,
      },
      chainId: 1, // metamask -> accounts -> settings -> networks -> localhost 8545 -> set chainId to 1
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts: getPrivateKeysFromMnemonic(developmentMnemonic),
    }
  },
};

const { vars } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");
require("dotenv").config();

const {
  ALCHEMY_SEPOLIA_API_KEY_URL,
  ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
  ALCHEMY_AMOY_API_KEY_URL,
  ALCHEMY_METER_KEY_URL,
  ACCOUNT_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.26",
  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    amoy: {
      url: ALCHEMY_AMOY_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    lisk_sepolia: {
      url: ALCHEMY_LISK_SEPOLIA_API_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    meter: {
      url: ALCHEMY_METER_KEY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
      chainId: 1115,
    },
    core: {
      url: "https://rpc.test.btcs.network",
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },

  etherscan: {
    apiKey: {
      "lisk-sepolia-testnet": "empty",
    },
    customChains: [
      {
        network: "lisk-sepolia-testnet",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },
};


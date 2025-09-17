require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19", // For SecureVoting contract
        settings: {
          optimizer: {
            enabled: true,
            runs: 200, // Optimize for deployment cost
          },
        },
      },
      {
        version: "0.8.28", // For any other contracts
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/bDbxKCofkt3tnnzOji2yF",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY.replace('0x', '')}`] : [],
      chainId: 11155111,
      gas: 6000000, // Gas limit
      gasPrice: 20000000000, // 20 gwei
      timeout: 300000, // 5 minutes timeout
      confirmations: 2, // Wait for 2 confirmations
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "Y62NV73Q7P4FKZ4MBRI2N3T6A8PQA3769V",
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  mocha: {
    timeout: 300000, // 5 minutes for tests
  },
};

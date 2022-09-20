require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('hardhat-deploy')
require('solidity-coverage')
require('hardhat-gas-reporter')
require('hardhat-contract-sizer')
require('dotenv').config()

const RINKEBY_RPC_URL =
  process.env.RINKEBY_RPC_URL || 'https://eth-rinkeby/example'
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x756c10f614795972a3d269eefdea3ee32d557065297f08bd6d0a7f30db04eebd'
const COINMKTCAP_API_KEY = process.env.COINMKTCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key'

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    // rinkeby: {
    //   url: RINKEBY_RPC_URL,
    //   accounts: [PRIVATE_KEY],
    //   chainId: 4,
    //   blockConfirmations: 6,
    // },
  },
  solidity: '0.8.9',
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: false,
    coinmarketcap: COINMKTCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    player: {
      default: 1,
    },
  },
  mocha: {
    timeout: 300000, // 300 seconds max
  }
}

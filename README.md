# Smart Contract Lottery

## About The Project

My Ethereum Crowd Funding project is full stack decentralized application built who's [backend](https://github.com/larry-lime/fund-me-backend) is built with Solidity and the Hardhat Ethereum development framework. Tests are done with Mocha & Chai in Javascript. Additionally, it utilizes Chainlink pricefeed oracles and its [frontend](https://github.com/larry-lime/solidity-js-fcc) is coded in vanilla HTML/CSS and Javascript. This project was created as a part of Patrick Collin's Solidity and Javascript smart contract course with Free Code Camp.

## Getting Started

### Prerequisites

* [yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
* [metamask](https://metamask.io/download/) 
* [live-server](https://www.npmjs.com/package/live-server) 

### Installation

1. Clone the repo (backend)
```shell
git clone https://github.com/larry-lime/fund-me-backend.git
```
2. Run yarn
```shell
cd fund-me-backend && yarn
```

## Usage

####  Deploy to local blockchain
  ```shell
  yarn hardhat deploy
  ```
####  Run tests
  ```shell
  yarn hardhat test
  ```
####  Test Coverage
  ```shell
  yarn hardhat deploy
  ```
####  Interact with frontend
  1. Spin-up node
  ```shell
  yarn hardhat node
  ```
  2. Git clone frontend repo
  ```shell
  git clone https://github.com/larry-lime/solidity-js-fcc.git
  cd fund-me-html
  ```
  3. Start live-server
  ```shell
  npx live-server
  ```
<!-- The contract deployment ID is: -->
<!-- ``` -->
<!-- 0xB2Bf3C63C8aFD537a76fD346Ab88a24B6C76aAf5 -->
<!-- ``` -->
<!-- https://rinkeby.etherscan.io/address/0xB2Bf3C63C8aFD537a76fD346Ab88a24B6C76aAf5 -->

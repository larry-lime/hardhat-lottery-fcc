const { assert, expect } = require('chai')
const { getNamedAccounts, deployments, ethers, network } = require('hardhat')
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config')

// Only run staging tests when on a testnet
developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Staging Tests', () => {
      let raffle, raffleEntranceFee, deployer

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract('Raffle', deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
      })

      describe('fulfillRandomWords', () => {
        it('works with live Chainlink keepers and Chainlink VRF, we get a random number', async () => {
          // Enter the raffle jo
          console.log('Setting up test...')
          const startingTimeStamp = await raffle.getLastTimeStamp()
          const accounts = await ethers.getSigners()
          // setup the listener before we enter the raffle
          // Just in case the blockchain moves really fast
          // This is an event listener that gets run, but does not complete until there is a resolve or reject value
          console.log('Setting up listener...')
          await new Promise(async (resolve, reject) => {
            raffle.once('WinnerPicked', async () => {
              console.log('WinnerPicked event fired!')
              try {
                // add our asserts here
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimeStamp = await raffle.getLastTimeStamp()

                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[0].address)
                assert.equal(raffleState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (error) {
                console.log(error)
                reject(error)
              }
            })
            // Then entering the raffle
            console.log('Entering Raffle...')
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
            await tx.wait(1)
            console.log('Ok, time to wait...')
            const winnerStartingBalance = await accounts[0].getBalance()
            // And this code WONT complete until our listener has finished listening
          })
        })
      })
    })

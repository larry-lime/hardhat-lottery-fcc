const { assert, expect } = require('chai')
const { getNamedAccounts, deployments, ethers, network } = require('hardhat')
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', () => {
      let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
      const chainId = network.config.chainId

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(['all'])
        raffle = await ethers.getContract('Raffle', deployer)
        vrfCoordinatorV2Mock = await ethers.getContract(
          'VRFCoordinatorV2Mock',
          deployer
        )
        raffleEntranceFee = await raffle.getEntranceFee()
        interval = await raffle.getInterval()
      })

      describe('constructor', () => {
        it('initializes the raffle correctly', async () => {
          const raffleState = await raffle.getRaffleState()
          assert.equal(raffleState.toString(), '0')
          assert.equal(interval.toString(), networkConfig[chainId]['interval'])
        })
      })
      describe('enterRaffle', () => {
        it('reverts when you do not pay enough', async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            'Raffle__NotEnoughETHEntered'
          )
        })
        it('records players when they enter', async () => {
          // raffle entrance fee
          await raffle.enterRaffle({ value: raffleEntranceFee })
          const playerFromContract = await raffle.getPlayer(0)
          assert.equal(playerFromContract, deployer)
        })
        it('emits event on enter', async () => {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, 'RaffleEnter')
        })
        it('doesnt allow entrance when raffle is calculating', async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: 'evm_mine', params: [] })
          await raffle.performUpkeep([])
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWith('Raffle__RaffleNotOpen')
        })
      })
      describe('checkUpKeep', () => {
        it('returns false if people havent sent any ETH', async () => {
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })
        it('returns false if raffle isnt open', async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: 'evm_mine', params: [] })
          await raffle.performUpkeep([])
          const raffleState = await raffle.getRaffleState()
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert.equal(raffleState.toString() == '1', upkeepNeeded == false)
        })
        it('returns false if enough time hasnt passed', async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() - 1,
          ])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep('0x')
          assert(!upkeepNeeded)
        })
        it('returns true if enough time has passed, has players, eth, and is open', async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: 'evm_mine', params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep('0x')
          assert(upkeepNeeded)
        })
        describe('performUpkeep', () => {
          it('it can only run if checkupkeep is true', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send('evm_increaseTime', [
              interval.toNumber() + 1,
            ])
            await network.provider.request({ method: 'evm_mine', params: [] })
            const tx = await raffle.performUpkeep([])
            assert(tx)
          })
          it('reverts when checkupkeep is false', async () => {
            await expect(raffle.performUpkeep([])).to.be.revertedWith(
              'Raffle__UpkeepNotNeeded'
            )
          })
          it('updates the raffle state, emits and event, and calls the vrf coordinator', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee })
            await network.provider.send('evm_increaseTime', [
              interval.toNumber() + 1,
            ])
            await network.provider.request({ method: 'evm_mine', params: [] })
            const txResponse = await raffle.performUpkeep([])
            const txReceipt = await txResponse.wait(1)
            const raffleState = await raffle.getRaffleState()
            const requestId = txReceipt.events[1].args.requestId
            assert(requestId.toNumber() > 0)
            assert(raffleState.toString(), "1")
          })
        })
      })
      describe('fulfillRandomWords', () => {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: 'evm_mine', params: [] })
        })
        it('can only be called after performUpkeep', async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith('nonexistent request')
        })
        it('picks a winner, resets the lottery, and sends money', async () => {
          const additionallEntrants = 3
          const startingAccountIndex = 1 // deployers = 0
          const accounts = await ethers.getSigners()

          for (
            let i = startingAccountIndex;
            i < startingAccountIndex + additionallEntrants;
            i++
          ) {
            const accountConnectedRaffle = raffle.connect(accounts[i])
            await accountConnectedRaffle.enterRaffle({
              value: raffleEntranceFee,
            })
          }
          const startingTimeStamp = await raffle.getLastTimeStamp()
          // performUpkeep (mock being chainlink keepers)
          // fulfill randomrods (mock being the Chainlink VRM)
          // We will have to wait for the fulfillRandoeWords to be called
          // We need to set up a listeners
          // I have to really understand what's happening here
          await new Promise(async (resolve, reject) => {
            raffle.once('WinnerPicked', async () => {
              console.log('Found the event!')
              try {
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const endingTimeStamp = await raffle.getLastTimeStamp()
                const numPlayers = await raffle.getNumberOfPlayers()
                const winnerEndingBalance = await accounts[1].getBalance()
                assert.equal(numPlayers.toString(), '0')
                assert.equal(raffleState.toString(), '0')
                assert(endingTimeStamp > startingTimeStamp)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(
                    raffleEntranceFee
                      .mul(additionallEntrants)
                      .add(raffleEntranceFee)
                      .toString()
                  )
                )
              } catch (e) {
                reject(e)
              }
              resolve()
            })
            // Setting up the listener
            const tx = await raffle.performUpkeep([])
            const txReceipt = await tx.wait(1)
            const winnerStartingBalance = await accounts[1].getBalance()
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              raffle.address
            )
          })
        })
      })
    })

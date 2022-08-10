// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// Raffle

// Enter the lottery (paying some amount)

// Pick a randomg winner (verifiably random)

// Winner to be selected every X minutes -> completely automated

// Chainlink Oracle -> Randomness, Automated executaion, (Chainlink keeper)

error Raffle__NotEnoughETHEntered();

contract Raffle {
  /*  */
  uint256 private immutable i_entranceFee;
  address payable[] private s_players;

  constructor(uint256 entranceFee) {
    i_entranceFee = entranceFee;
  }

  function enterRaffle() public payable {
    // require msg.value > i_entranceFee
    if (msg.value < i_entranceFee) {
      revert Raffle__NotEnoughETHEntered();
    }
    s_players.push(payable(msg.sender));
    // Emit an event when we update a dynamic array or mapping
  }

  function getEntranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  function getPlayer() public view returns (uint256) {
    return i_entranceFee;
  }
  // function pick random winnder
}

# Crypto Escrow Smart Contract

A simple Ethereum escrow smart contract built with Solidity and Hardhat.

## Features

- Create an escrow by depositing ETH.
- Release funds to the seller.
- Refund funds to the buyer.
- Prevent unauthorized releases.
- Validate escrow participants and deposit amounts.
- Emit events for escrow lifecycle actions.

## Tech Stack

- Solidity 0.8.28
- Hardhat 2.x
- Ethers.js 5.x
- Chai
- Ethereum Virtual Machine (EVM)

## Escrow Lifecycle

```text
Created -> Released
        -> Refunded

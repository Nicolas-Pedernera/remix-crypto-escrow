# CryptoEscrow

A secure Ethereum escrow smart contract built with Solidity and Hardhat.

CryptoEscrow allows a buyer to deposit ETH into an escrow associated with a seller. The buyer can release the funds to the seller or request a refund. The contract enforces authorization, state transitions, input validation, reentrancy protection, and safe ETH transfers.

## Features

- Create an escrow by depositing ETH.
- Release funds to the seller.
- Refund funds to the buyer.
- Restrict escrow actions to the authorized buyer.
- Prevent duplicate and invalid state transitions.
- Validate escrow participants and deposit amounts.
- Protect fund-moving functions with OpenZeppelin ReentrancyGuard.
- Check ETH transfer success.
- Preserve escrow funds when a seller rejects payment.
- Emit events for escrow lifecycle actions.
- Automated security-focused test coverage.

## Security Model

The escrow follows a simple state machine:

Created -> Released
Created -> Refunded

Once an escrow reaches a terminal state, it cannot be executed again.

Security protections include:

- OpenZeppelin ReentrancyGuard.
- nonReentrant protection.
- Checks-Effects-Interactions pattern.
- Buyer authorization checks.
- Input validation.
- Escrow state validation.
- Explicit verification of ETH transfer success.

See the complete security documentation in docs/security.md.

## Test Coverage

The project currently has 12 passing tests covering:

- Escrow creation.
- ETH deposits.
- Successful release.
- Successful refund.
- Unauthorized release.
- Unauthorized refund.
- Duplicate release.
- Refund after release.
- Release after refund.
- Nonexistent escrows.
- Rejected ETH transfers.
- Invalid input conditions.

Run the tests with:

npx hardhat test

## Project Structure

remix-crypto-escrow/
├── contracts/
│   └── CryptoEscrow.sol
├── test/
│   └── CryptoEscrow.test.js
├── docs/
│   └── security.md
├── hardhat.config.js
├── package.json
├── package-lock.json
└── README.md

## Tech Stack

- Solidity 0.8.28
- Hardhat 2.x
- Ethers.js 5.x
- OpenZeppelin Contracts
- Chai
- Ethereum Virtual Machine (EVM)

## Installation

git clone <repository-url>
cd remix-crypto-escrow
npm install

## Compile

npx hardhat compile

## Test

npx hardhat test

Expected result:

12 passing

## Escrow Lifecycle

Created -> Released
Created -> Refunded

The following transitions are intentionally prevented:

Released -> Released
Released -> Refunded
Refunded -> Released
Refunded -> Refunded

## Security Scope

This project is an educational portfolio implementation designed to demonstrate secure smart contract development practices.

It has not been audited by an independent smart contract security auditor and should not be considered production-ready financial infrastructure without further security review.

## License

MIT

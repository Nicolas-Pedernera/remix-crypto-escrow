# CryptoEscrow

> Secure Ethereum escrow smart contract demonstrating state-machine design, access control, reentrancy protection, safe ETH transfers, automated testing, and CI.

[![Tests](https://github.com/Nicolas-Pedernera/remix-crypto-escrow/actions/workflows/test.yml/badge.svg)](https://github.com/Nicolas-Pedernera/remix-crypto-escrow/actions/workflows/test.yml)

CryptoEscrow is a portfolio-oriented Ethereum smart contract implementing a deterministic escrow workflow between a buyer and a seller.

The project demonstrates secure software engineering principles applied to blockchain infrastructure, including explicit state transitions, authorization boundaries, input validation, failure handling, automated testing, and continuous integration.

## Architecture

An escrow begins in the `Created` state and can transition only once to a terminal state.

```text
Created -> Released
Created -> Refunded
```

Once an escrow reaches a terminal state, it cannot be executed again.

## Key Features

- ETH escrow creation.
- Buyer-authorized fund release.
- Buyer-authorized refund.
- Explicit escrow state machine.
- Protection against duplicate execution.
- Input validation for escrow participants and amounts.
- OpenZeppelin `ReentrancyGuard`.
- `nonReentrant` protection on fund-moving functions.
- Checks-Effects-Interactions pattern.
- Explicit ETH transfer failure handling.
- Event emission for escrow lifecycle actions.
- Automated security-focused tests.
- GitHub Actions continuous integration.

## Security Model

### Access Control

Only the buyer associated with an escrow can execute `release()` or `refund()`.

### Reentrancy Protection

Fund-moving functions use OpenZeppelin `ReentrancyGuard` through the `nonReentrant` modifier.

The contract follows the Checks-Effects-Interactions pattern by validating inputs, updating escrow state, clearing the stored amount, and only then performing the external ETH transfer.

### Safe ETH Transfers

ETH transfers use a low-level call and explicitly verify the result. If the recipient rejects the payment, the transaction reverts and the escrow remains intact.

### State Integrity

Valid transitions:

```text
Created -> Released
Created -> Refunded
```

Invalid transitions:

```text
Released -> Released
Released -> Refunded
Refunded -> Released
Refunded -> Refunded
```

### Input Validation

The contract rejects zero-value deposits, the zero address as seller, the buyer as seller, nonexistent escrow IDs, and invalid lifecycle operations.

## Test Coverage

The project currently contains **12 passing tests** covering functional behavior and security boundaries.

Covered scenarios include escrow creation, ETH deposits, successful release, successful refund, unauthorized operations, invalid inputs, duplicate execution, invalid state transitions, nonexistent escrows, and rejected ETH transfers.

Run the test suite:

```bash
npx hardhat test
```

## Continuous Integration

GitHub Actions automatically installs dependencies with `npm ci`, compiles the smart contracts, and runs the automated test suite on pushes and pull requests targeting `main`.

## Technology Stack

| Technology | Purpose |
|---|---|
| Solidity 0.8.28 | Smart contract development |
| Hardhat 2.x | Compilation and testing |
| Ethers.js 5.x | Ethereum interaction |
| OpenZeppelin Contracts | Security utilities |
| Chai | Test assertions |
| EVM | Smart contract execution |
| GitHub Actions | Continuous integration |
| Node.js / npm | Development environment |

## Project Structure

```text
remix-crypto-escrow/
├── contracts/
│   └── CryptoEscrow.sol
├── test/
│   └── CryptoEscrow.test.js
├── docs/
│   └── security.md
├── .github/
│   └── workflows/
│       └── test.yml
├── hardhat.config.js
├── package.json
├── package-lock.json
├── LICENSE
└── README.md
```

## Getting Started

### Requirements

- Node.js
- npm
- Git

### Installation

```bash
git clone https://github.com/Nicolas-Pedernera/remix-crypto-escrow.git
cd remix-crypto-escrow
npm install
```

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

## Engineering Principles Demonstrated

- Explicit state management.
- Clear authorization boundaries.
- Defensive input validation.
- Failure-aware external interactions.
- Atomic transaction behavior.
- Security-first implementation.
- Automated regression testing.
- Continuous integration.
- Reproducible dependency installation.
- Technical documentation.

## Security Scope

CryptoEscrow is an educational and portfolio implementation designed to demonstrate secure smart contract development practices.

The contract has **not been independently audited** by a professional smart contract security auditor.

It should not be considered production-ready financial infrastructure without additional security review, threat modeling, testing, formal analysis, and independent auditing.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Built as a Solidity and Ethereum security-focused portfolio project by Nicolas Pedernera.

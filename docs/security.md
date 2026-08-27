# Security Model

## Overview

CryptoEscrow is designed around a simple escrow state machine where deposited ETH can only transition from `Created` to either `Released` or `Refunded`.

Once an escrow reaches a terminal state, it cannot be executed again.

## Access Control

Only the buyer associated with an escrow can call `release()` or `refund()`.

This prevents unrelated accounts from moving escrow funds.

## Reentrancy Protection

The `release()` and `refund()` functions use OpenZeppelin `ReentrancyGuard`.

In addition, the contract follows the Checks-Effects-Interactions pattern:

1. Validate the escrow and caller.
2. Update the escrow status.
3. Set the stored amount to zero.
4. Transfer ETH using a low-level call.

This prevents a malicious receiver from re-entering the escrow while funds are still recorded as available.

## Failed Payments

ETH transfers are checked for success.

If the seller rejects the payment, `release()` reverts and the escrow remains in the `Created` state with its original amount intact.

The test suite includes a dedicated rejecting receiver contract to verify this behavior.

## State Machine

The escrow lifecycle is:

`Created -> Released`

or

`Created -> Refunded`

The following transitions are intentionally impossible:

- `Released -> Released`
- `Released -> Refunded`
- `Refunded -> Released`
- `Refunded -> Refunded`

## Input Validation

The contract rejects:

- zero-value deposits;
- the zero address as seller;
- using the buyer as seller;
- nonexistent escrow IDs.

## Test Coverage

The project includes tests covering:

- escrow creation;
- ETH deposits;
- successful release;
- successful refund;
- unauthorized release;
- unauthorized refund;
- duplicate release;
- refund after release;
- release after refund;
- nonexistent escrows;
- rejected ETH transfers;
- invalid input conditions.

## Scope

This project is an educational portfolio implementation and has not been audited by an independent smart contract security auditor.

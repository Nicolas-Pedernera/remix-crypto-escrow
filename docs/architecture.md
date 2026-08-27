# Architecture

## Overview

CryptoEscrow is an Ethereum smart contract that allows a buyer to deposit ETH into an escrow agreement and release the funds to a seller once the agreement is completed.

The contract keeps custody of the deposited ETH until one of the supported terminal actions occurs:

- The buyer releases the funds to the seller.
- The buyer requests a refund.

## Flow

```text
┌──────────────┐
│    Buyer     │
└──────┬───────┘
       │
       │ createEscrow()
       │ + ETH
       ▼
┌────────────────────┐
│   CryptoEscrow     │
│  Smart Contract    │
└─────────┬──────────┘
          │
          ├───────────────┐
          │               │
          │ release()     │ refund()
          ▼               ▼
   ┌────────────┐   ┌────────────┐
   │   Seller   │   │    Buyer   │
   │ receives   │   │ receives   │
   │    ETH     │   │    refund  │
   └────────────┘   └────────────┘

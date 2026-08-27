// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CryptoEscrow is ReentrancyGuard {
    enum Status {
        Created,
        Released,
        Refunded
    }

    error InvalidSeller();
    error BuyerCannotBeSeller();
    error InvalidAmount();
    error OnlyBuyer();
    error EscrowDoesNotExist();
    error EscrowNotActive();
    error TransferFailed();
    error RefundFailed();

    struct Escrow {
        address payable buyer;
        address payable seller;
        uint256 amount;
        Status status;
    }

    uint256 private _nextEscrowId;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );

    event EscrowReleased(
        uint256 indexed escrowId,
        address indexed seller,
        uint256 amount
    );

    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed buyer,
        uint256 amount
    );

    modifier onlyBuyer(uint256 escrowId) {
        if (msg.sender != escrows[escrowId].buyer) revert OnlyBuyer();
        _;
    }

    modifier onlyExistingEscrow(uint256 escrowId) {
        if (escrowId >= _nextEscrowId) revert EscrowDoesNotExist();
        _;
    }

    function createEscrow(
        address payable seller
    ) external payable returns (uint256 escrowId) {
        if (seller == address(0)) revert InvalidSeller();
        if (seller == msg.sender) revert BuyerCannotBeSeller();
        if (msg.value == 0) revert InvalidAmount();

        escrowId = _nextEscrowId++;

        escrows[escrowId] = Escrow({
            buyer: payable(msg.sender),
            seller: seller,
            amount: msg.value,
            status: Status.Created
        });

        emit EscrowCreated(
            escrowId,
            msg.sender,
            seller,
            msg.value
        );
    }

    function release(
        uint256 escrowId
    )
        external
        nonReentrant
        onlyExistingEscrow(escrowId)
        onlyBuyer(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];

        if (escrow.status != Status.Created) revert EscrowNotActive();

        escrow.status = Status.Released;

        uint256 amount = escrow.amount;
        escrow.amount = 0;

        (bool success, ) = escrow.seller.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit EscrowReleased(escrowId, escrow.seller, amount);
    }

    function refund(
        uint256 escrowId
    )
        external
        nonReentrant
        onlyExistingEscrow(escrowId)
        onlyBuyer(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];

        if (escrow.status != Status.Created) revert EscrowNotActive();

        escrow.status = Status.Refunded;

        uint256 amount = escrow.amount;
        escrow.amount = 0;

        (bool success, ) = escrow.buyer.call{value: amount}("");
        if (!success) revert RefundFailed();

        emit EscrowRefunded(escrowId, escrow.buyer, amount);
    }

    function getEscrow(
        uint256 escrowId
    )
        external
        view
        onlyExistingEscrow(escrowId)
        returns (
            address buyer,
            address seller,
            uint256 amount,
            Status status
        )
    {
        Escrow memory escrow = escrows[escrowId];

        return (
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            escrow.status
        );
    }
}

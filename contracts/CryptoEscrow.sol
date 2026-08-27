// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CryptoEscrow {
    enum Status {
        Created,
        Released,
        Refunded
    }

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
        require(msg.sender == escrows[escrowId].buyer, "Only buyer");
        _;
    }

    modifier onlyExistingEscrow(uint256 escrowId) {
        require(escrowId < _nextEscrowId, "Escrow does not exist");
        _;
    }

    function createEscrow(
        address payable seller
    ) external payable returns (uint256 escrowId) {
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Buyer cannot be seller");
        require(msg.value > 0, "Amount must be greater than zero");

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
    ) external onlyExistingEscrow(escrowId) onlyBuyer(escrowId) {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.status == Status.Created, "Escrow is not active");

        escrow.status = Status.Released;

        uint256 amount = escrow.amount;
        escrow.amount = 0;

        (bool success, ) = escrow.seller.call{value: amount}("");
        require(success, "Transfer failed");

        emit EscrowReleased(escrowId, escrow.seller, amount);
    }

    function refund(
        uint256 escrowId
    ) external onlyExistingEscrow(escrowId) onlyBuyer(escrowId) {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.status == Status.Created, "Escrow is not active");

        escrow.status = Status.Refunded;

        uint256 amount = escrow.amount;
        escrow.amount = 0;

        (bool success, ) = escrow.buyer.call{value: amount}("");
        require(success, "Refund failed");

        emit EscrowRefunded(escrowId, escrow.buyer, amount);
    }

    function getEscrow(
        uint256 escrowId
    ) external view onlyExistingEscrow(escrowId) returns (
        address buyer,
        address seller,
        uint256 amount,
        Status status
    ) {
        Escrow memory escrow = escrows[escrowId];

        return (
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            escrow.status
        );
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract RejectingSeller {
    receive() external payable {
        revert("ETH rejected");
    }
}

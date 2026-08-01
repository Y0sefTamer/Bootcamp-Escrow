// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Escrow {
    address public buyer;
    address public seller;
    address public arbiter;

    uint256 public amount;

    bool public buyerApproved;
    bool public sellerApproved;

    bool public isDisputedRaised;

    constructor(address _buyer, address _seller, address _arbiter) payable {
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        amount = msg.value;
    }

    function approvedByBuyer() external {
        require(msg.sender == buyer, "Only buyer can approve");
        buyerApproved = true;
    }

    function approvedBySeller() external {
        require(msg.sender == seller, "Only seller can approve");
        sellerApproved = true;
    }
}

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
        releaseIfAgreed();
    }

    function approvedBySeller() external {
        require(msg.sender == seller, "Only seller can approve");
        sellerApproved = true;
        releaseIfAgreed();
    }

    function releaseIfAgreed() internal {
        if(buyerApproved && sellerApproved && !isDisputedRaised) {
            (bool success, ) = seller.call{value: amount}("");
            require(success, "Transfer to seller failed");
        }
    }   

    function raiseDispute() external {
        require(msg.sender == buyer || msg.sender == seller, "Only buyer or seller can raise dispute");
        isDisputedRaised = true;
    }

    function resolveDispute(bool releaseToSeller) external {
        require(msg.sender == arbiter, "Only arbiter can resolve dispute");
        require(isDisputedRaised, "No dispute to resolve");

        if(releaseToSeller) {
            (bool success, ) = seller.call{value: amount}("");
            require(success, "Transfer to seller failed");
        } else {
            (bool success, ) = buyer.call{value: amount}("");
            require(success, "Transfer to buyer failed");
        }

        isDisputedRaised = false;
    }   
}

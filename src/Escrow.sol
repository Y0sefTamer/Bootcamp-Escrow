// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Escrow {
    // Custom errors for better gas efficiency
    error Escrow__NotBuyer();
    error Escrow__NotSeller();
    error Escrow__NotArbiter();
    error Escrow__DisputeNotRaised();
    error Escrow__TransferFailed();
    error Escrow__NotAuthorizedToRaiseDispute();
    error Escrow__AlreadyResolved();

    // State Variables - Gas Optimized with immutable
    address public immutable i_buyer;
    address public immutable i_seller;
    address public immutable i_arbiter;
    uint256 public immutable i_amount;

    bool public buyerApproved;
    bool public sellerApproved;
    bool public isDisputedRaised;
    bool public isResolved; // To prevent multiple releases

    // Modifiers for Clean Architecture
    modifier onlyBuyer() {
        if (msg.sender != i_buyer) revert Escrow__NotBuyer();
        _;
    }

    modifier onlySeller() {
        if (msg.sender != i_seller) revert Escrow__NotSeller();
        _;
    }

    modifier onlyArbiter() {
        if (msg.sender != i_arbiter) revert Escrow__NotArbiter();
        _;
    }

    constructor(address _buyer, address _seller, address _arbiter) payable {
        i_buyer = _buyer;
        i_seller = _seller;
        i_arbiter = _arbiter;
        i_amount = msg.value;
    }

    function approvedByBuyer() external onlyBuyer {
        buyerApproved = true;
        releaseIfAgreed();
    }

    function approvedBySeller() external onlySeller {
        sellerApproved = true;
        releaseIfAgreed();
    }

    function releaseIfAgreed() internal {
        if (buyerApproved && sellerApproved && !isDisputedRaised && !isResolved) {
            isResolved = true; // State updated before external call (CEI Pattern)
            (bool success,) = i_seller.call{value: i_amount}("");
            if (!success) revert Escrow__TransferFailed();
        }
    }

    function raiseDispute() external {
        if (msg.sender != i_buyer && msg.sender != i_seller) {
            revert Escrow__NotAuthorizedToRaiseDispute();
        }
        isDisputedRaised = true;
    }

    function resolveDispute(bool releaseToSeller) external onlyArbiter {
        if (!isDisputedRaised) revert Escrow__DisputeNotRaised();
        if (isResolved) revert Escrow__AlreadyResolved();

        isDisputedRaised = false;
        isResolved = true;

        if (releaseToSeller) {
            (bool success,) = i_seller.call{value: i_amount}("");
            if (!success) revert Escrow__TransferFailed();
        } else {
            (bool success,) = i_buyer.call{value: i_amount}("");
            if (!success) revert Escrow__TransferFailed();
        }
    }
}
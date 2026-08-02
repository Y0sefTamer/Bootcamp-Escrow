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
        if (msg.sender != buyer) {
            revert Escrow__NotBuyer();
        }

        buyerApproved = true;
        releaseIfAgreed();
    }

    function approvedBySeller() external {
        if (msg.sender != seller) {
            revert Escrow__NotSeller();
        }
        sellerApproved = true;
        releaseIfAgreed();
    }

    function releaseIfAgreed() internal {
        if (buyerApproved && sellerApproved && !isDisputedRaised) {
            (bool success,) = seller.call{value: amount}("");

            if (!success) {
                revert Escrow__TransferFailed();
            }
        }
    }

    function raiseDispute() external {
        if (msg.sender != buyer && msg.sender != seller) {
            revert Escrow__NotAuthorizedToRaiseDispute();
        }
        isDisputedRaised = true;
    }

    function resolveDispute(bool releaseToSeller) external {
        if (msg.sender != arbiter) {
            revert Escrow__NotArbiter();
        }
        if (!isDisputedRaised) {
            revert Escrow__DisputeNotRaised();
        }

        if (releaseToSeller) {
            (bool success,) = seller.call{value: amount}("");

            if (!success) {
                revert Escrow__TransferFailed();
            }
        } else {
            (bool success,) = buyer.call{value: amount}("");

            if (!success) {
                revert Escrow__TransferFailed();
            }
        }

        isDisputedRaised = false;
    }
}

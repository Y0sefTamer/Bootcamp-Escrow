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
}
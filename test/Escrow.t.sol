// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow public escrow;

    address public buyer = makeAddr("buyer");
    address public seller = makeAddr("seller");
    address public arbiter = makeAddr("arbiter");

    uint256 public constant AMOUNT = 1 ether;

    function setUp() public {
        escrow = new Escrow{value: AMOUNT}(buyer, seller, arbiter);
    }
}

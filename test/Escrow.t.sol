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

    /*//////////////////////////
             Constructor
    //////////////////////////*/

    function testConstructor() public view {
        assertEq(escrow.buyer(), buyer);
        assertEq(escrow.seller(), seller);
        assertEq(escrow.arbiter(), arbiter);
        assertEq(escrow.amount(), AMOUNT);
        assertEq(address(escrow).balance, AMOUNT);
        assertFalse(escrow.buyerApproved());
        assertFalse(escrow.sellerApproved());
        assertFalse(escrow.isDisputedRaised());
    }

    /*//////////////////////////
            Approve by buyer
    //////////////////////////*/
    function testApprovedByBuyer() public {
        vm.prank(buyer);
        escrow.approvedByBuyer();
        assertTrue(escrow.buyerApproved());
    }

    function testApprovedByBuyerNotBuyer() public {
        vm.prank(seller);
        vm.expectRevert(Escrow.Escrow__NotBuyer.selector);
        escrow.approvedByBuyer();
    }

    /*//////////////////////////
            Approve by seller
    //////////////////////////*/
    function testApprovedBySeller() public {
        vm.prank(seller);
        escrow.approvedBySeller();
        assertTrue(escrow.sellerApproved());
    }

    function testApprovedBySellerNotSeller() public {
        vm.prank(buyer);
        vm.expectRevert(Escrow.Escrow__NotSeller.selector);
        escrow.approvedBySeller();
    }
}

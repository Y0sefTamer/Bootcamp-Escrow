// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";
///@dev The RejectEther contract is used to test the Escrow contract's ability to reject ether transfers.
contract RejectEther {
    // empty contract intentionally to reject ether transfers
}

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

    /*//////////////////////////
             Release if agreed
    //////////////////////////*/
    function testReleaseIfAgreed() public {
        uint256 sellerBalanceBefore = seller.balance;
        vm.prank(buyer);
        escrow.approvedByBuyer();
        vm.prank(seller);
        escrow.approvedBySeller();
        assertEq(address(escrow).balance, 0);
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);
    }
    function testReleaseIfAgreedNotApprovedWhenDisputRaised() public {
        vm.prank(buyer);
        escrow.approvedByBuyer();
        vm.prank(buyer);
        escrow.raiseDispute();
        vm.prank(seller);
        escrow.approvedBySeller();
        assertTrue(escrow.isDisputedRaised());
        assertTrue(escrow.buyerApproved());
        assertTrue(escrow.sellerApproved());
        assertEq(address(escrow).balance, AMOUNT);
    }
    function testReleaseIfAgreedNotApprovedWhenDisputRaisedBySeller() public {
        vm.prank(seller);
        escrow.approvedBySeller();
        vm.prank(seller);
        escrow.raiseDispute();
        vm.prank(buyer);
        escrow.approvedByBuyer();
        assertTrue(escrow.isDisputedRaised());
        assertTrue(escrow.buyerApproved());
        assertTrue(escrow.sellerApproved());
        assertEq(address(escrow).balance, AMOUNT);
    }
    function testReleaseIfAgreedRevertWhenTransferFailed() public {
        RejectEther rejectEther = new RejectEther();
        Escrow escrowWithRejectEther = new Escrow{value: AMOUNT}(buyer, address(rejectEther), arbiter);
        vm.prank(buyer);
        escrowWithRejectEther.approvedByBuyer();
        vm.prank(address(rejectEther));
        vm.expectRevert(Escrow.Escrow__TransferFailed.selector);
        escrowWithRejectEther.approvedBySeller();
    }

     /*//////////////////////////
             Raise dispute
    //////////////////////////*/
    function testRaiseDisputeByBuyer() public {
        vm.prank(buyer);
        escrow.raiseDispute();
        assertTrue(escrow.isDisputedRaised());
    }
    function testRaiseDisputeBySeller() public {
        vm.prank(seller);
        escrow.raiseDispute();
        assertTrue(escrow.isDisputedRaised());
    }
    function testRaiseDisputeNotAuthorized() public {
        vm.prank(arbiter);
        vm.expectRevert(Escrow.Escrow__NotAuthorizedToRaiseDispute.selector);
        escrow.raiseDispute();
    }
}

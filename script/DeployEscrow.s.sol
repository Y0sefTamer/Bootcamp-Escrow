// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";
import {console} from "forge-std/console.sol";

contract DeployEscrow is Script {
    address public buyer = 0xde1D740C1990364F7eB6265267D5A55b40056116;
    address public seller = 0xC9fA01744BFbB1d9d7e1121a6AD4B5501D0eB83a;
    address public arbiter = 0x2c52EfB5D7390513142E82B30DE2e28888c19220;

    function run() external returns (Escrow) {
        vm.startBroadcast();
        Escrow escrow = new Escrow(buyer, seller, arbiter);
        vm.stopBroadcast();
        return escrow;
    }
}

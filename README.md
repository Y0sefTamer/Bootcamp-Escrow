# Bootcamp Escrow Contract 🤝

A foundational Escrow smart contract project built as part of a Web3 Solidity Bootcamp. This repository demonstrates how to write, test, and deploy a decentralized trust mechanism where a third-party arbiter dictates when funds are released to a Seller.

## 🌟 Features

* **Three-Party System:** Implements the classic escrow model with a Depositor, an Arbiter, and a Seller.
* **Secure Fund Holding:** The contract securely holds the Depositor's ETH during deployment.
* **Arbiter Approval:** Only the designated Arbiter can approve the transaction and release the funds.
* **Immutable Rules:** Once deployed, the terms (arbiter, Seller, and deposit amount) cannot be altered, ensuring absolute trust.
* **Custom Events:** Emits an `Approved` event when the transaction is successfully finalized.

## 🛠️ Tech Stack

* **Smart Contracts:** Solidity `^0.8.20`
* **Framework:** Foundry
* **Testing:** Chai / Mocha / Ethers.js

## 🏛️ How It Works

1. **Deployment:** The **Depositor** deploys the contract, setting the addresses of the **Arbiter** and the **Seller**. The Depositor funds the contract with ETH during this deployment step.
2. **Holding:** The ETH remains locked inside the smart contract. No one, not even the Depositor or the Arbiter, can withdraw it for themselves.
3. **Approval:** Once the agreed-upon off-chain conditions are met (e.g., a service is delivered), the **Arbiter** calls the `approve()` function.
4. **Release:** The contract automatically transfers the locked ETH to the **Seller**.


import {
  BrowserProvider,
  Contract,
  JsonRpcSigner,
  type ContractRunner,
  type Eip1193Provider,
} from "ethers";

export const ESCROW_CONTRACT_ADDRESS =
  "0x9ABd55EE7BFcF44483573402d7742280C540392D";

export const SEPOLIA_ETHERSCAN_URL = "https://sepolia.etherscan.io";

export const ESCROW_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_buyer", type: "address", internalType: "address" },
      { name: "_seller", type: "address", internalType: "address" },
      { name: "_arbiter", type: "address", internalType: "address" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "approvedByBuyer",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approvedBySeller",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buyerApproved",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_amount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_arbiter",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_buyer",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_seller",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDisputedRaised",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isResolved",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "raiseDispute",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveDispute",
    inputs: [{ name: "releaseToSeller", type: "bool", internalType: "bool" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sellerApproved",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "error",
    name: "Escrow__AlreadyResolved",
    inputs: [],
  },
  {
    type: "error",
    name: "Escrow__DisputeNotRaised",
    inputs: [],
  },
  {
    type: "error",
    name: "Escrow__NotArbiter",
    inputs: [],
  },
  {
    type: "error",
    name: "Escrow__NotAuthorizedToRaiseDispute",
    inputs: [],
  },
  {
    type: "error",
    name: "Escrow__NotBuyer",
    inputs: [],
  },
  {
    type: "error",
    name: "Escrow__NotSeller",
    inputs: [],
  },
  {
    type: "error",
    name: "Escrow__TransferFailed",
    inputs: [],
  },
] as const;

export interface WalletConnection {
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  account: string;
  chainId: bigint;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getEthereum(): Eip1193Provider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it to continue.");
  }
  return window.ethereum;
}

export async function connectWallet(): Promise<WalletConnection> {
  const ethereum = getEthereum();
  await ethereum.request({ method: "eth_requestAccounts" });

  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  const network = await provider.getNetwork();

  return { provider, signer, account, chainId: network.chainId };
}

export function getEscrowContract(runner: ContractRunner): Contract {
  return new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, runner);
}

export { Contract };
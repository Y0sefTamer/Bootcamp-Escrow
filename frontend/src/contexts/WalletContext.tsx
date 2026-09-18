"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BrowserProvider, type Contract, type JsonRpcSigner } from "ethers";
import { connectWallet, getEscrowContract } from "@/src/utils/web3";

interface WalletContextValue {
  account: string | null;
  chainId: bigint | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contract = useMemo(
    () => (signer ? getEscrowContract(signer) : null),
    [signer]
  );

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { provider, signer, account, chainId } = await connectWallet();
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setChainId(chainId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to MetaMask."
      );
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setError(null);
  }, []);

  const value: WalletContextValue = useMemo(
    () => ({
      account,
      chainId,
      provider,
      signer,
      contract,
      isConnecting,
      error,
      connect,
      disconnect,
    }),
    [account, chainId, provider, signer, contract, isConnecting, error, connect, disconnect]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider.");
  }
  return context;
}
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getDefaultProvider, type Contract } from "ethers";
import { useWallet } from "@/src/contexts";
import { getEscrowContract } from "@/src/utils/web3";

export type EscrowAction =
  | "approvedByBuyer"
  | "approvedBySeller"
  | "raiseDispute"
  | "resolveToSeller"
  | "resolveToBuyer";

export interface EscrowState {
  buyer: string;
  seller: string;
  arbiter: string;
  amount: bigint;
  buyerApproved: boolean;
  sellerApproved: boolean;
  disputeRaised: boolean;
  isResolved: boolean;
}

function getTxErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;

    if (e.code === "ACTION_REJECTED") {
      return "Transaction rejected by the user.";
    }

    const info = e.info as Record<string, unknown> | undefined;
    const nested =
      info?.error && typeof info.error === "object"
        ? (info.error as Record<string, unknown>)
        : undefined;

    const errorName = nested?.errorName ?? e.errorName;
    if (errorName) {
      const label = String(errorName)
        .replace(/^Escrow__/, "Escrow")
        .replace(/([A-Z])/g, " $1")
        .trim();
      return `Transaction reverted \u2014 ${label}.`;
    }

    const shortMessage = nested?.shortMessage ?? nested?.message;
    if (typeof shortMessage === "string") {
      return `Transaction reverted \u2014 ${shortMessage}.`;
    }
    if (typeof e.shortMessage === "string") {
      return e.shortMessage;
    }
    if (typeof info?.error === "string") {
      return info.error;
    }
    if (typeof e.reason === "string") {
      return e.reason;
    }
    // RPC error body (e.g. "execution reverted: <reason>" from MetaMask).
    if (
      typeof e.data === "object" &&
      e.data !== null &&
      typeof (e.data as { message?: unknown }).message === "string"
    ) {
      return String((e.data as { message: string }).message);
    }
    if (typeof e.message === "string") {
      return e.message;
    }
  }
  return String(err);
}

async function fetchEscrowState(contract: Contract): Promise<EscrowState> {
  const [buyer, seller, arbiter, amount, buyerApproved, sellerApproved, disputeRaised, isResolved] =
    await Promise.all([
      contract.i_buyer(),
      contract.i_seller(),
      contract.i_arbiter(),
      contract.i_amount(),
      contract.buyerApproved(),
      contract.sellerApproved(),
      contract.isDisputedRaised(),
      contract.isResolved(),
    ]);

  return {
    buyer: String(buyer),
    seller: String(seller),
    arbiter: String(arbiter),
    amount: BigInt(amount),
    buyerApproved: Boolean(buyerApproved),
    sellerApproved: Boolean(sellerApproved),
    disputeRaised: Boolean(disputeRaised),
    isResolved: Boolean(isResolved),
  };
}

export function useEscrow() {
  const { provider, signer, account } = useWallet();

  const readContract = useMemo(() => {
    const runner = provider ?? getDefaultProvider("sepolia");
    return getEscrowContract(runner);
  }, [provider]);

  const writableContract = useMemo(
    () => (signer ? getEscrowContract(signer) : null),
    [signer]
  );

  const [state, setState] = useState<EscrowState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<EscrowAction | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetchEscrowState(readContract)
      .then((data) => {
        if (ignore) return;
        setState(data);
      })
      .catch((err) => {
        if (ignore) return;
        setTxError(getTxErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [readContract]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchEscrowState(readContract);
      setState(data);
      setTxError(null);
    } catch (err) {
      setTxError(getTxErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [readContract]);

  const run = useCallback(
    async (action: EscrowAction) => {
      if (!writableContract) {
        setTxError("Connect your wallet first.");
        return;
      }

      setPending(action);
      setTxHash(null);
      setTxError(null);

      try {
        let tx;
        switch (action) {
          case "approvedByBuyer":
            tx = await writableContract.approvedByBuyer();
            break;
          case "approvedBySeller":
            tx = await writableContract.approvedBySeller();
            break;
          case "raiseDispute":
            tx = await writableContract.raiseDispute();
            break;
          case "resolveToSeller":
            tx = await writableContract.resolveDispute(true);
            break;
          case "resolveToBuyer":
            tx = await writableContract.resolveDispute(false);
            break;
        }
        if (!tx) throw new Error("Unknown action.");

        setTxHash(tx.hash);
        await tx.wait();
        await refresh();
      } catch (err) {
        setTxError(getTxErrorMessage(err));
      } finally {
        setPending(null);
      }
    },
    [writableContract, refresh]
  );

  return {
    state,
    isLoading,
    pending,
    txHash,
    txError,
    run,
    isConnected: Boolean(account),
  };
}
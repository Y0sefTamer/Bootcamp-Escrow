"use client";

import { useWallet } from "@/src/contexts";
import { useEscrow, type EscrowAction } from "@/src/hooks/useEscrow";
import {
  ActionButton,
  RoleSection,
  TransactionStatus,
  WalletButton,
} from "@/src/components";
import { formatEthAmount, shortenAddress } from "@/src/utils";
import { ESCROW_CONTRACT_ADDRESS } from "@/src/utils/web3";

const ACTION_PENDING_LABELS: Record<EscrowAction, string> = {
  approvedByBuyer: "Approving as Buyer \u2014 waiting for confirmation\u2026",
  approvedBySeller: "Approving as Seller \u2014 waiting for confirmation\u2026",
  raiseDispute: "Raising dispute \u2014 waiting for confirmation\u2026",
  resolveToSeller: "Resolving \u2014 releasing to Seller\u2026",
  resolveToBuyer: "Resolving \u2014 refunding Buyer\u2026",
};

export default function Home() {
  const { account } = useWallet();
  const { state, isLoading, pending, txHash, txError, run } = useEscrow();

  const isYou = (address: string | null) =>
    Boolean(
      account && address && account.toLowerCase() === address.toLowerCase()
    );

  const isPending = (action: EscrowAction) => pending === action;
  const isBusy = pending !== null;

  const buyerApproved = state?.buyerApproved ?? false;
  const sellerApproved = state?.sellerApproved ?? false;
  const disputeRaised = state?.disputeRaised ?? false;
  const isResolved = state?.isResolved ?? false;

  const overallStatus = isResolved
    ? { label: "Released", tone: "bg-emerald-600" }
    : disputeRaised
      ? { label: "Dispute raised", tone: "bg-red-600" }
      : buyerApproved && sellerApproved
        ? { label: "Both approved \u2014 releasing", tone: "bg-emerald-500" }
        : { label: "Awaiting approvals", tone: "bg-amber-500" };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Escrow DApp
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sepolia ·{" "}
              <a
                href={`https://sepolia.etherscan.io/address/${ESCROW_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-sky-700 underline underline-offset-2 dark:text-sky-400"
              >
                {shortenAddress(ESCROW_CONTRACT_ADDRESS)}
              </a>
            </p>
          </div>
          <WalletButton />
        </header>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Locked balance
              </p>
              <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {isLoading && !state ? (
                  <span className="animate-pulse text-zinc-400">Loading…</span>
                ) : (
                  <>
                    {formatEthAmount(state?.amount ?? 0n)}
                    <span className="ml-2 text-lg font-medium text-zinc-500 dark:text-zinc-400">
                      ETH
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${overallStatus.tone}`}
              >
                {overallStatus.label}
              </span>
              <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {account ? shortenAddress(account) : "Wallet not connected"}
              </p>
            </div>
          </div>
        </section>

        <TransactionStatus
          pending={pending ? ACTION_PENDING_LABELS[pending] : null}
          txHash={txHash}
          error={txError}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <RoleSection
            role="Buyer"
            address={state?.buyer ?? null}
            isYou={isYou(state?.buyer ?? null)}
            status={
              isResolved
                ? buyerApproved
                  ? "Approved"
                  : "Released"
                : buyerApproved
                  ? "Approved"
                  : "Not approved"
            }
            statusTone={
              buyerApproved ? "green" : isYou(state?.buyer ?? null) ? "amber" : "neutral"
            }
          >
            {buyerApproved ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                You already approved the release.
              </p>
            ) : (
              <ActionButton
                onClick={() => run("approvedByBuyer")}
                disabled={!isYou(state?.buyer ?? null) || disputeRaised || isResolved || isBusy}
                pending={isPending("approvedByBuyer")}
                title={
                  isYou(state?.buyer ?? null)
                    ? "Approve the escrow release"
                    : "Only the Buyer can call this"
                }
              >
                Approve (as Buyer)
              </ActionButton>
            )}
            <ActionButton
              tone="danger"
              onClick={() => run("raiseDispute")}
              disabled={!isYou(state?.buyer ?? null) || disputeRaised || isResolved || isBusy}
              pending={isPending("raiseDispute")}
            >
              Raise Dispute
            </ActionButton>
          </RoleSection>

          <RoleSection
            role="Seller"
            address={state?.seller ?? null}
            isYou={isYou(state?.seller ?? null)}
            status={
              isResolved
                ? sellerApproved
                  ? "Approved"
                  : "Funds released"
                : sellerApproved
                  ? "Approved"
                  : "Not approved"
            }
            statusTone={
              sellerApproved ? "green" : isYou(state?.seller ?? null) ? "amber" : "neutral"
            }
          >
            {sellerApproved ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                You already approved the release.
              </p>
            ) : (
              <ActionButton
                tone="success"
                onClick={() => run("approvedBySeller")}
                disabled={!isYou(state?.seller ?? null) || disputeRaised || isResolved || isBusy}
                pending={isPending("approvedBySeller")}
                title={
                  isYou(state?.seller ?? null)
                    ? "Approve the escrow release"
                    : "Only the Seller can call this"
                }
              >
                Approve (as Seller)
              </ActionButton>
            )}
            <ActionButton
              tone="danger"
              onClick={() => run("raiseDispute")}
              disabled={!isYou(state?.seller ?? null) || disputeRaised || isResolved || isBusy}
              pending={isPending("raiseDispute")}
            >
              Raise Dispute
            </ActionButton>
          </RoleSection>

          <RoleSection
            role="Arbiter"
            address={state?.arbiter ?? null}
            isYou={isYou(state?.arbiter ?? null)}
            status={
              isResolved
                ? "Resolved"
                : disputeRaised
                  ? "Dispute to resolve"
                  : "Standing by"
            }
            statusTone={disputeRaised ? "red" : "neutral"}
          >
            {!disputeRaised && !isResolved && (
              <p className="rounded-lg bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                Waiting for a dispute to resolve.
              </p>
            )}
            <ActionButton
              tone="success"
              onClick={() => run("resolveToSeller")}
              disabled={!isYou(state?.arbiter ?? null) || !disputeRaised || isResolved || isBusy}
              pending={isPending("resolveToSeller")}
            >
              Release to Seller
            </ActionButton>
            <ActionButton
              tone="danger"
              onClick={() => run("resolveToBuyer")}
              disabled={!isYou(state?.arbiter ?? null) || !disputeRaised || isResolved || isBusy}
              pending={isPending("resolveToBuyer")}
            >
              Refund Buyer
            </ActionButton>
          </RoleSection>
        </div>

        {!account && (
          <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Connect your MetaMask wallet to interact with the escrow.
          </p>
        )}
      </main>
    </div>
  );
}
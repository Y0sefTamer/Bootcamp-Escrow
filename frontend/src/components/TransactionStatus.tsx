"use client";

import { SEPOLIA_ETHERSCAN_URL } from "@/src/utils/web3";

interface TransactionStatusProps {
  pending: string | null;
  txHash: string | null;
  error: string | null;
}

export function TransactionStatus({
  pending,
  txHash,
  error,
}: TransactionStatusProps) {
  if (!pending && !txHash && !error) return null;

  return (
    <div className="space-y-2" aria-live="polite">
      {pending && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-600"
          />
          {pending}
        </div>
      )}
      {txHash && (
        <a
          href={`${SEPOLIA_ETHERSCAN_URL}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate font-mono text-xs text-sky-700 underline underline-offset-2 dark:text-sky-400"
        >
          {txHash.slice(0, 10)}…{txHash.slice(-6)} — View on Etherscan
        </a>
      )}
      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
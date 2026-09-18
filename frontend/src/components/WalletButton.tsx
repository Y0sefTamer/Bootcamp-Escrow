"use client";

import { useWallet } from "@/src/contexts";
import { shortenAddress } from "@/src/utils";

export function WalletButton() {
  const { account, isConnecting, error, connect, disconnect } = useWallet();

  return (
    <div className="flex flex-col items-end gap-1">
      {account ? (
        <button
          type="button"
          onClick={disconnect}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          title="Disconnect wallet"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {shortenAddress(account)}
        </button>
      ) : (
        <button
          type="button"
          onClick={connect}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isConnecting ? (
            <>
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-400/30 dark:border-t-zinc-900"
              />
              Connecting…
            </>
          ) : (
            "Connect Wallet"
          )}
        </button>
      )}
      {error && (
        <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
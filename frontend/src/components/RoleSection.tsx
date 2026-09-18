"use client";

import type { ReactNode } from "react";
import { shortenAddress } from "@/src/utils";

type Role = "Buyer" | "Seller" | "Arbiter";
type StatusTone = "green" | "red" | "amber" | "neutral";

interface RoleSectionProps {
  role: Role;
  address: string | null;
  isYou: boolean;
  status: string;
  statusTone: StatusTone;
  children?: ReactNode;
}

const STATUS_CLASSES: Record<StatusTone, string> = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
  neutral:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const ROLE_ICONS: Record<Role, string> = {
  Buyer: "B",
  Seller: "S",
  Arbiter: "A",
};

export function RoleSection({
  role,
  address,
  isYou,
  status,
  statusTone,
  children,
}: RoleSectionProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {ROLE_ICONS[role]}
          </span>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
              {role}
            </h3>
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {address ? shortenAddress(address) : "\u2014"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isYou && (
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-zinc-50 dark:text-zinc-900">
              You
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASSES[statusTone]}`}
          >
            {status}
          </span>
        </div>
      </header>
      {children && <div className="flex flex-col gap-2">{children}</div>}
    </section>
  );
}
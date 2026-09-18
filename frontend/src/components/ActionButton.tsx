"use client";

import type { ReactNode } from "react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
  tone?: "primary" | "danger" | "success";
  title?: string;
  children: ReactNode;
}

const TONES = {
  primary:
    "border-zinc-300 bg-zinc-900 text-white hover:bg-zinc-700 dark:border-zinc-600 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
  danger:
    "border-red-300 bg-red-600 text-white hover:bg-red-700 dark:border-red-500",
  success:
    "border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 dark:border-emerald-500",
};

export function ActionButton({
  onClick,
  disabled,
  pending,
  tone = "primary",
  title,
  children,
}: ActionButtonProps) {
  const isDisabled = disabled || pending;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${TONES[tone]}`}
    >
      {pending && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-zinc-400 dark:border-t-zinc-900"
        />
      )}
      {pending ? "Sending\u2026" : children}
    </button>
  );
}
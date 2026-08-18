"use client";

import { useState } from "react";

import { changeSaleStatus } from "@/app/actions/admin";
import type { AdminFlashSale, SaleStatus } from "@/app/lib/admin-types";
import { LEGAL_TRANSITIONS } from "@/app/lib/admin-types";
import { SubmitButton } from "@/components/admin/FormControls";
import { WarningIcon } from "@/components/admin/icons";

/**
 * The lifecycle controls — the highest-consequence buttons in the console.
 *
 * Only legal transitions are offered, mirroring the switch in
 * `AdminSaleService.changeStatus`. The server refuses anything else regardless,
 * so a stale table here produces a rejected request rather than a corrupted
 * sale.
 *
 * Every transition out of ACTIVE, and the one into it, is confirmed. All three
 * touch Redis irreversibly: activating pre-warms the counter and opens the sale
 * to real money, ending tears the counter down and writes the final unsold
 * figure back to Postgres. None of them can be undone from this screen —
 * ENDED and EXHAUSTED are terminal.
 */

type Transition = {
  status: SaleStatus;
  label: string;
  variant: "primary" | "flash" | "danger";
  /** Null skips the dialog, for transitions that risk nothing. */
  confirm: { title: string; body: string } | null;
};

function transitionsFor(sale: AdminFlashSale): Transition[] {
  const allowed = LEGAL_TRANSITIONS[sale.status];

  const all: Transition[] = [
    {
      status: "ACTIVE",
      label: "Activate",
      variant: "flash",
      confirm: {
        title: "Open this sale for business?",
        body: `Activating writes ${sale.allocatedStock} units into Redis and publishes the sale metadata the checkout script reads. Customers can buy immediately. A sale cannot be returned to SCHEDULED once it has opened.`,
      },
    },
    {
      status: "ENDED",
      label: sale.status === "SCHEDULED" ? "Cancel sale" : "End sale",
      variant: "danger",
      confirm:
        sale.status === "SCHEDULED"
          ? null
          : {
              title: "End this sale now?",
              body: "The unsold count is written back to Postgres and the Redis counter, metadata, and per-buyer record are deleted. Checkouts stop immediately. ENDED is terminal — the sale cannot be reopened.",
            },
    },
    {
      status: "EXHAUSTED",
      label: "Mark sold out",
      variant: "danger",
      confirm: {
        title: "Mark this sale exhausted?",
        body: "Normally the stock-sync consumer sets this by itself when the counter reaches zero. Doing it by hand closes the sale and tears down its Redis keys even if units remain. EXHAUSTED is terminal.",
      },
    },
  ];

  return all.filter((transition) => allowed.includes(transition.status));
}

export function SaleStatusActions({
  sale,
  size = "sm",
}: {
  sale: AdminFlashSale;
  size?: "sm" | "md";
}) {
  const [pendingTransition, setPendingTransition] = useState<Transition | null>(
    null,
  );

  const transitions = transitionsFor(sale);

  if (transitions.length === 0) {
    return (
      <span className="text-xs text-slate-400">
        {sale.status === "ENDED" ? "Ended" : "Sold out"}
      </span>
    );
  }

  const tone = {
    primary: "text-slate-700 hover:bg-slate-100",
    flash: "text-orange-600 hover:bg-orange-50",
    danger: "text-red-600 hover:bg-red-50",
  } as const;

  return (
    <>
      <div className={`flex items-center gap-1 ${size === "md" ? "gap-2" : ""}`}>
        {transitions.map((transition) => (
          <form
            key={transition.status}
            action={changeSaleStatus}
            // Transitions with no confirm dialog post straight through; the
            // rest hand off to the dialog, which owns the real submit.
            onSubmit={(event) => {
              if (transition.confirm) {
                event.preventDefault();
                setPendingTransition(transition);
              }
            }}
          >
            <input type="hidden" name="id" value={sale.id} />
            <input type="hidden" name="status" value={transition.status} />
            <button
              type="submit"
              className={`rounded-lg px-2.5 py-1.5 font-semibold transition-colors ${
                size === "md" ? "text-sm" : "text-xs"
              } ${tone[transition.variant]}`}
            >
              {transition.label}
            </button>
          </form>
        ))}
      </div>

      {pendingTransition?.confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transition-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  pendingTransition.variant === "flash"
                    ? "bg-orange-50"
                    : "bg-red-50"
                }`}
              >
                <WarningIcon
                  className={`h-5 w-5 ${
                    pendingTransition.variant === "flash"
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                />
              </span>
              <div>
                <h2
                  id="transition-title"
                  className="text-base font-bold text-slate-900"
                >
                  {pendingTransition.confirm.title}
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  {pendingTransition.confirm.body}
                </p>
                <p className="mt-2.5 text-sm text-slate-500">
                  <span aria-hidden="true">{sale.emoji}</span>{" "}
                  <span className="font-medium text-slate-700">
                    {sale.productName}
                  </span>{" "}
                  <span className="font-mono text-xs">({sale.sku})</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingTransition(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>

              <form action={changeSaleStatus}>
                <input type="hidden" name="id" value={sale.id} />
                <input
                  type="hidden"
                  name="status"
                  value={pendingTransition.status}
                />
                <SubmitButton
                  variant={
                    pendingTransition.variant === "flash" ? "flash" : "danger"
                  }
                  pendingLabel="Applying…"
                >
                  {pendingTransition.label}
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

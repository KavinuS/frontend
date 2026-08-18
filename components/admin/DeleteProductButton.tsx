"use client";

import { useState } from "react";

import { deleteProduct } from "@/app/actions/admin";
import { SubmitButton } from "@/components/admin/FormControls";
import { WarningIcon } from "@/components/admin/icons";

/**
 * Two-step delete.
 *
 * Not `window.confirm`: the native dialog cannot say *why* this particular
 * delete is dangerous, and the danger is specific. The schema cascades, so
 * removing a product takes its sales — and their Redis counters — with it. The
 * backend refuses while a SCHEDULED or ACTIVE sale exists, but ENDED sales are
 * fair game and they are the audit trail for money that already changed hands.
 */
export function DeleteProductButton({
  id,
  title,
  activeSaleCount,
}: {
  id: number;
  title: string;
  activeSaleCount: number;
}) {
  const [confirming, setConfirming] = useState(false);

  // The server enforces this too; disabling the control just avoids offering a
  // button whose only outcome is an error banner.
  const blocked = activeSaleCount > 0;

  if (blocked) {
    return (
      <span
        className="inline-flex cursor-not-allowed items-center gap-1.5 text-xs font-semibold text-slate-300"
        title={`${activeSaleCount} scheduled or active sale(s) reference this product. End them first.`}
      >
        Delete
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <WarningIcon className="h-5 w-5 text-red-600" />
          </span>
          <div>
            <h2 id="delete-title" className="text-base font-bold text-slate-900">
              Delete “{title}”?
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              This also removes every ended sale for this product, and those
              rows are the record of orders that were already paid for. Existing
              orders keep their own copy of the name and price, so order history
              stays readable — but the sale they point at will be gone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>

          <form action={deleteProduct}>
            <input type="hidden" name="id" value={id} />
            <SubmitButton variant="danger" pendingLabel="Deleting…">
              Delete product
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}

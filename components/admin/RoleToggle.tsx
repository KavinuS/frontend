"use client";

import { useState } from "react";

import { changeUserRole } from "@/app/actions/admin";
import type { AdminUser } from "@/app/lib/admin-types";
import { SubmitButton } from "@/components/admin/FormControls";
import { WarningIcon } from "@/components/admin/icons";

/**
 * Promote to admin, or demote back to customer.
 *
 * Confirmed in both directions. Promotion hands over the ability to end live
 * sales and change other people's roles; demotion can lock a person out of a
 * panel they are currently using.
 *
 * The dialog states the delay explicitly because the role travels in the JWT
 * rather than being read per request, so a change only takes effect for the
 * target when their current token expires. Without saying so, a demotion looks
 * like it silently failed.
 */
export function RoleToggle({
  user,
  isSelf,
}: {
  user: AdminUser;
  /** The signed-in admin's own row. The backend refuses self-demotion. */
  isSelf: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  const promoting = user.role === "CUSTOMER";
  const nextRole = promoting ? "ADMIN" : "CUSTOMER";

  if (isSelf) {
    return (
      <span
        className="text-xs text-slate-300"
        title="You cannot change your own role. Another admin has to do it."
      >
        That&apos;s you
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          promoting
            ? "text-blue-600 hover:bg-blue-50"
            : "text-red-600 hover:bg-red-50"
        }`}
      >
        {promoting ? "Make admin" : "Remove admin"}
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  promoting ? "bg-blue-50" : "bg-red-50"
                }`}
              >
                <WarningIcon
                  className={`h-5 w-5 ${
                    promoting ? "text-blue-600" : "text-red-600"
                  }`}
                />
              </span>

              <div>
                <h2 id="role-title" className="text-base font-bold text-slate-900">
                  {promoting
                    ? `Give ${user.name} admin access?`
                    : `Remove ${user.name}'s admin access?`}
                </h2>

                <p className="mt-1.5 text-sm text-slate-600">
                  {promoting
                    ? "Admins can create and end live flash sales, delete products, and change other people's roles — including yours."
                    : "They will lose access to this console. If they are the only other admin, the backend will refuse."}
                </p>

                <p className="mt-2.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Takes effect when their current session token expires — the
                  role is carried in the JWT, not looked up per request.
                </p>

                <p className="mt-2.5 font-mono text-xs text-slate-500">
                  {user.email}
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

              <form action={changeUserRole}>
                <input type="hidden" name="id" value={user.id} />
                <input type="hidden" name="role" value={nextRole} />
                <SubmitButton
                  variant={promoting ? "primary" : "danger"}
                  pendingLabel="Applying…"
                >
                  {promoting ? "Make admin" : "Remove admin"}
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

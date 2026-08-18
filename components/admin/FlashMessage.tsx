"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CheckIcon, CloseIcon, WarningIcon } from "@/components/admin/icons";

/**
 * Banner for the result of an action that had nowhere to put its outcome.
 *
 * The list-page actions — delete a product, end a sale, change a role — are
 * plain `<form action={...}>` submissions with no `useActionState` to hold a
 * return value, so they redirect back with the message in a search param and
 * this reads it.
 *
 * Dismissing strips the param with `replace`, so the message does not come back
 * on refresh and does not add a history entry the Back button has to walk
 * through.
 */
export function FlashMessage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const notice = searchParams.get("notice");
  const warmed = searchParams.get("warmed");

  const message =
    error ??
    notice ??
    (warmed === null
      ? null
      : `Re-published metadata for ${warmed} active sale(s). Stock counters were left untouched.`);

  if (!message) return null;

  const isError = Boolean(error);

  const dismiss = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("error");
    params.delete("notice");
    params.delete("warmed");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 ${
        isError
          ? "border-red-200 bg-red-50"
          : "border-green-200 bg-green-50"
      }`}
    >
      {isError ? (
        <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      ) : (
        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      )}

      <p
        className={`flex-1 text-sm font-medium ${
          isError ? "text-red-800" : "text-green-800"
        }`}
      >
        {message}
      </p>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss message"
        className={`shrink-0 rounded-lg p-1 transition-colors ${
          isError
            ? "text-red-400 hover:bg-red-100 hover:text-red-700"
            : "text-green-500 hover:bg-green-100 hover:text-green-800"
        }`}
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { SearchIcon } from "@/components/admin/icons";

/**
 * Debounced search that lives in the URL.
 *
 * The query is a search param rather than component state so the result set is
 * linkable, survives a reload, and can be handed to someone else. The page
 * itself stays a Server Component and re-renders with the new params.
 *
 * `page` is dropped on every change: filtering to three results while sitting
 * on page 4 shows an empty table that looks like a bug.
 */
export function SearchInput({
  placeholder = "Search…",
  paramName = "search",
}: {
  placeholder?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlValue = searchParams.get(paramName) ?? "";

  const [value, setValue] = useState(urlValue);
  const [lastUrlValue, setLastUrlValue] = useState(urlValue);

  // Re-sync when the URL changes from outside this input — a nav click, or the
  // browser Back button. Without it, going back leaves the old text on screen
  // while the table below shows unfiltered results.
  //
  // Adjusted during render, not in an effect: React discards the in-progress
  // render and re-runs with the corrected state before committing, so the stale
  // text is never painted. An effect would paint it, then correct it.
  if (urlValue !== lastUrlValue) {
    setLastUrlValue(urlValue);
    setValue(urlValue);
  }

  useEffect(() => {
    if (value === urlValue) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (value) params.set(paramName, value);
      else params.delete(paramName);
      params.delete("page");

      // A transition keeps the input responsive while the server re-renders,
      // and gives us `isPending` for the spinner.
      startTransition(() => router.replace(`${pathname}?${params}`));
    }, 300);

    return () => clearTimeout(timer);
  }, [value, urlValue, paramName, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:w-72">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
      {isPending && (
        <span
          className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Page controls for the three paged tables.
 *
 * Rendered as links rather than buttons so they work without JavaScript, can be
 * opened in a new tab, and are prefetched by the router. The backend caps
 * `size` at 100 regardless of what is asked for.
 */
export function Pagination({
  page,
  totalPages,
  total,
  size,
}: {
  /** Zero-based, matching Spring Data's `Page.getNumber()`. */
  page: number;
  totalPages: number;
  total: number;
  size: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams);
    // Page 0 is the default; leaving `?page=0` on the URL is noise.
    if (target > 0) params.set("page", String(target));
    else params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const first = total === 0 ? 0 : page * size + 1;
  const last = Math.min(total, (page + 1) * size);

  const linkClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50";
  const disabledClass =
    "rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-300";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
      <p className="text-xs text-slate-500">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="font-semibold text-slate-700">{first}</span>
            –<span className="font-semibold text-slate-700">{last}</span> of{" "}
            <span className="font-semibold text-slate-700">{total}</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        {page > 0 ? (
          <Link href={hrefFor(page - 1)} className={linkClass} rel="prev">
            Previous
          </Link>
        ) : (
          // A disabled <span> rather than a dead link: a link to the current
          // page still navigates, which looks like the button did nothing.
          <span className={disabledClass}>Previous</span>
        )}

        <span className="px-1 text-xs text-slate-500">
          Page {page + 1} of {Math.max(1, totalPages)}
        </span>

        {page + 1 < totalPages ? (
          <Link href={hrefFor(page + 1)} className={linkClass} rel="next">
            Next
          </Link>
        ) : (
          <span className={disabledClass}>Next</span>
        )}
      </div>
    </div>
  );
}

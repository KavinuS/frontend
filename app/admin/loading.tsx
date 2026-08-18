/**
 * Skeleton for the admin section.
 *
 * Every admin page reads the session cookie and fetches with `no-store`, so all
 * of them are rendered at request time and none can be served from a prerender.
 * This is what fills the gap.
 *
 * Shaped like the screens it stands in for — header, stat row, table — rather
 * than a spinner, so the layout does not jump when the real content lands.
 */
export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="mb-6">
        <div className="h-7 w-48 rounded-lg bg-slate-200" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="mt-3 h-7 w-24 rounded-lg bg-slate-200" />
            <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-slate-50 px-5 py-4"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-1/5 rounded bg-slate-100" />
            </div>
            <div className="h-6 w-20 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

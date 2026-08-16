import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";

/**
 * Root 404. It carries its own minimal chrome rather than the shop layout,
 * because a not-found can be triggered from any route group — including the
 * auth pages, which deliberately have no navbar.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">

      <Link
        href="/"
        className="mb-10 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-orange-400 to-orange-600 text-base shadow-sm shadow-orange-500/30"
        >
          ⚡
        </span>
        FlashX
      </Link>

      <p className="font-mono text-sm font-semibold uppercase tracking-widest text-orange-600">
        404
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
        This page sold out
      </h1>

      <p className="mt-3 max-w-md text-slate-600">
        We couldn&apos;t find what you were looking for. It may have been moved,
        or the sale may have ended.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/sales" variant="flash" size="lg">
          Browse flash sales
        </ButtonLink>
        <ButtonLink href="/" variant="secondary" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}

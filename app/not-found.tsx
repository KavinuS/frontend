import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";

/**
 * Root 404. It carries its own minimal chrome rather than the shop layout,
 * because a not-found can be triggered from any route group — including the
 * auth pages, which deliberately have no navbar. That means it also has to opt
 * into `fx-scope` itself.
 */
export default function NotFound() {
  return (
    <main className="fx-scope flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Link
        href="/"
        className="mb-10 flex items-center gap-2.5 font-heading text-lg font-extrabold text-fx-ink"
      >
        <span aria-hidden="true" className="block h-3.5 w-3.5 bg-fx-accent" />
        FLASHX
      </Link>

      <p className="fx-mono fx-eyebrow text-fx-accent">404</p>

      <h1 className="mt-3 text-[clamp(36px,6vw,56px)] tracking-[-0.03em]">
        This page sold out
      </h1>

      <p className="fx-muted mt-3 max-w-[46ch]">
        We couldn&apos;t find what you were looking for. It may have been moved,
        or the sale may have ended.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/sales" size="lg">
          Browse flash sales
        </ButtonLink>
        <ButtonLink href="/" variant="secondary" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}

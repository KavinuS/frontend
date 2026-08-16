import { ButtonLink } from "./Button";

/** One max-width and gutter for every page, so nothing drifts out of alignment. */
export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 ${className}`}>{children}</div>
  );
}

/** Eyebrow + heading + optional description, used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "flash",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "flash" | "brand";
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p
            className={`mb-2 text-sm font-semibold uppercase tracking-wider ${
              tone === "flash" ? "text-orange-600" : "text-blue-600"
            }`}
          >
            {eyebrow}
          </p>
        )}

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Shared empty state for the cart and orders pages. */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl"
      >
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-slate-600">{description}</p>

      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} size="lg" className="mt-6">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  );
}

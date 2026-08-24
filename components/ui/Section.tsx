import { ButtonLink } from "./Button";

/**
 * One max-width and gutter for every page, so nothing drifts out of alignment.
 * 1240px with a 40px gutter is the measure the storefront design is drawn on;
 * the gutter drops to 24px below `md` where 40px would eat the line length.
 */
export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1240px] px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

/**
 * The rule that opens or closes a block.
 *
 * Two pixels of divider, wiped in from the left. It is the system's main
 * structural device — sections are separated by rules rather than boxed into
 * cards — so it is a component rather than a repeated div.
 */
export function Rule({
  weight = 2,
  animate = false,
  className = "",
}: {
  weight?: 1 | 2;
  /** Wipe in from the left. Only worth it on the rule under a page heading. */
  animate?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`${animate ? "origin-left animate-fx-rule-x" : ""} bg-fx-divider ${className}`}
      style={{ height: weight }}
    />
  );
}

/** Eyebrow + heading + optional description, used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="fx-eyebrow mb-3 text-fx-accent">{eyebrow}</p>
        )}

        <h2 className="text-[32px] tracking-[-0.02em]">{title}</h2>

        {description && (
          <p className="fx-muted mt-2 max-w-[58ch]">{description}</p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Shared empty state for the cart, orders and error pages.
 *
 * Ruled rather than boxed: a dashed rounded card would be the only rounded
 * shape on the site. The icon is kept because it is the one place the storefront
 * has no photography or data to fill the space with.
 */
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
    <div className="border-y-2 border-fx-divider px-6 py-16 text-center">
      <div aria-hidden="true" className="mb-5 text-4xl">
        {icon}
      </div>

      <h3 className="text-[25px]">{title}</h3>
      <p className="fx-muted mx-auto mt-3 max-w-[48ch]">{description}</p>

      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} size="lg" className="mt-7">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  );
}

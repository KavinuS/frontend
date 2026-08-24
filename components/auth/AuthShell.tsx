import Link from "next/link";

/**
 * The two numbers worth putting on a sign-in page.
 *
 * The old version listed four. Two is the design's count and the better one:
 * "5,000 requests per second" and "0 oversells" are the same claim from both
 * ends — the load it takes and the thing it never gets wrong — and a grid of
 * four turns a claim into wallpaper.
 */
const proofPoints = [
  { value: "5,000+", label: "Requests per second" },
  { value: "0", label: "Oversells" },
];

/**
 * Two-column shell for /login, /register and /forgot-password.
 *
 * Not an `app/(auth)/layout.tsx`: that route group also holds routes which must
 * not get the marketing panel.
 *
 * The left panel is the one place in the whole storefront that fills a surface
 * with the accent. It is the only screen with nothing else on it to compete
 * with, and it is where the brand has to do the work — everywhere else, red is
 * rationed to the thing you should look at.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="fx-scope grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
      {/* Decorative, so it collapses away on small screens rather than pushing
          the form below the fold. */}
      <aside className="hidden flex-col justify-between gap-12 bg-fx-accent px-12 py-14 text-fx-bg lg:flex">
        <Link
          href="/"
          className="font-heading text-lg font-extrabold tracking-[0.04em] text-fx-bg"
        >
          FLASHX
        </Link>

        <div>
          <p className="fx-eyebrow flex items-center gap-2.5 tracking-[0.16em]">
            <span
              aria-hidden="true"
              className="block h-2.25 w-2.25 animate-fx-dot bg-fx-bg"
            />
            Flash sale is live
          </p>

          <p className="mt-5.5 animate-fx-wipe font-heading text-[clamp(38px,4.6vw,62px)] font-extrabold leading-[0.96] tracking-[-0.03em]">
            Limited stock.
            <br />
            Thousands
            <br />
            of buyers.
          </p>

          <p className="mt-5.5 max-w-[40ch] opacity-90">
            Every reservation is atomic. Sign in so your order is tracked from
            the moment stock is claimed.
          </p>
        </div>

        <dl className="grid grid-cols-2 border-t-2 border-fx-bg/60">
          {proofPoints.map((point, index) => (
            <div key={point.label} className={index === 0 ? "pr-4.5 pt-4.5" : "pl-4.5 pt-4.5"}>
              <dt className="font-heading text-3xl font-extrabold">
                {point.value}
              </dt>
              <dd className="fx-eyebrow tracking-[0.12em] opacity-85">
                {point.label}
              </dd>
            </div>
          ))}
        </dl>
      </aside>

      <div className="flex items-center px-6 py-14 md:px-12">
        <div className="w-full max-w-105 animate-fx-lift [animation-delay:0.1s]">
          {/* Logo only shows where the brand panel is hidden. */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2.5 font-heading text-lg font-extrabold text-fx-ink lg:hidden"
          >
            <span aria-hidden="true" className="block h-3.5 w-3.5 bg-fx-accent" />
            FLASHX
          </Link>

          <h1 className="text-[40px] tracking-[-0.02em]">{title}</h1>
          <p className="fx-muted mt-2">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="fx-muted mt-6 text-[13px]">{footer}</p>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

const proofPoints = [
  { value: "5,000+", label: "Requests per second" },
  { value: "< 15ms", label: "Checkout latency" },
  { value: "100%", label: "Stock accuracy" },
  { value: "0", label: "Oversells" },
];

/**
 * Two-column shell for /login and /register.
 *
 * Not an `app/(auth)/layout.tsx`: that route group also holds /dashboard, which
 * must not get the marketing panel.
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
    <main className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">

      {/* Brand panel — decorative, so it collapses away on small screens
          rather than pushing the form below the fold. */}
      <aside className="hidden bg-slate-900 lg:flex lg:w-[45%] lg:flex-col lg:justify-between lg:p-12">

        <Link href="/" className="text-2xl font-bold text-white">
          ⚡ FlashX
        </Link>

        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-400 ring-1 ring-orange-500/30">
            ⚡ FLASH SALE IS LIVE
          </p>

          <h2 className="text-4xl font-bold leading-tight text-white">
            Limited Stock.
            <br />
            Thousands of Buyers.
          </h2>

          <p className="mt-4 max-w-sm text-slate-400">
            Every reservation is atomic. Sign in so your order is tracked from
            the moment stock is claimed.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4">
          {proofPoints.map((point) => (
            <div
              key={point.label}
              className="rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-4"
            >
              <dt className="text-xl font-bold text-blue-400">{point.value}</dt>
              <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {point.label}
              </dd>
            </div>
          ))}
        </dl>

      </aside>

      <div className="flex flex-1 items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Logo only shows where the brand panel is hidden. */}
          <Link
            href="/"
            className="mb-8 inline-block text-2xl font-bold text-slate-900 lg:hidden"
          >
            ⚡ FlashX
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-slate-600">{footer}</p>

        </div>
      </div>
    </main>
  );
}

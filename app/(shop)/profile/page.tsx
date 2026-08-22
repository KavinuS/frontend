import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/app/actions/auth";
import { formatDateTime, formatPrice } from "@/app/lib/format";
import { listMyOrders } from "@/app/lib/orders";
import { getSessionClaims } from "@/app/lib/session";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Profile — FlashX",
  description: "Your FlashX account details and activity.",
};

/**
 * The account page.
 *
 * A Server Component, because everything on it is server-held: the identity
 * comes out of the session cookie and the activity out of `GET /api/v1/orders`,
 * scoped to the JWT subject. Nothing here needs to be interactive, so none of
 * it ships to the browser.
 *
 * ## Why this is not the dashboard
 *
 * `/dashboard` answers "what did I buy" — stats and a feed of reservations.
 * This answers "who am I signed in as", which is the question someone asks when
 * an order went to the wrong account, when they are unsure whether they are on
 * their admin login, or when they want out. That belongs on a page that stays
 * stable and boring rather than mixed into a feed.
 *
 * ## Where the fields come from
 *
 * Name, email, and role are claims in the session token, read server-side and
 * deliberately not signature-verified here — see the note on
 * `getSessionClaims`. That is fine for display. The role badge decides what is
 * *drawn*, never what is permitted: `/admin` is gated by `requireAdmin()` and
 * the backend re-checks the signature on every admin call.
 */
export default async function ProfilePage() {
  const claims = await getSessionClaims();

  // No session at all. Unlike the dashboard's inline empty state there is
  // genuinely nothing to render without an identity, so a shell would be a
  // dead end — send them to sign in and back.
  if (!claims) {
    redirect("/login?next=/profile");
  }

  const orders = await listMyOrders();
  const rows = orders.ok ? orders.data : [];

  const confirmed = rows.filter((order) => order.status === "CONFIRMED");
  // Only confirmed orders count toward spend: a pending row is not committed
  // yet and a failed one never will be.
  const totalSpent = confirmed.reduce((sum, order) => sum + order.totalAmount, 0);

  // Orders arrive newest-first, so the oldest is the last one.
  const firstOrder = rows.at(-1);

  const isAdmin = claims.role === "ADMIN";

  return (
    <Container className="py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-2 text-slate-600">
          The account this browser is signed in as.
        </p>

        {/* ----------------------------------------------------- identity -- */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-5 border-b border-slate-100 p-6">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-700 to-slate-900 text-xl font-bold text-white"
            >
              {initialsFor(claims.name, claims.email)}
            </span>

            <div className="min-w-0">
              <p className="truncate text-2xl font-bold text-slate-900">
                {claims.name ?? "Your account"}
              </p>
              <p className="truncate text-sm text-slate-500">{claims.email}</p>

              <span
                className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  isAdmin
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {claims.role ?? "CUSTOMER"}
              </span>
            </div>
          </div>

          <dl className="divide-y divide-slate-100">
            <Row label="Name" value={claims.name} />
            <Row label="Email" value={claims.email} />
            <Row label="Role" value={claims.role ?? "CUSTOMER"} />
            {/*
              The account id is the `sub` claim, and the same value is stamped
              on every order row. Worth surfacing: it is what turns a support
              question into something answerable against the database.
            */}
            <Row label="Account ID" value={claims.sub} mono />
            <Row
              label="Session expires"
              value={
                claims.exp
                  ? formatDateTime(new Date(claims.exp * 1000).toISOString())
                  : undefined
              }
            />
          </dl>
        </section>

        {/* ----------------------------------------------------- activity -- */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Activity</h2>
            <Link
              href="/orders"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              All orders →
            </Link>
          </div>

          {/*
            A failed orders call degrades to a notice rather than taking the
            page down. The identity above is why someone came here and it is
            still perfectly good.
          */}
          {!orders.ok ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your order history could not be loaded. {orders.message}
            </p>
          ) : (
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <Stat label="Orders placed" value={String(rows.length)} />
              <Stat
                label="Confirmed"
                value={String(confirmed.length)}
                tone="text-green-600"
              />
              <Stat
                label="Total spent"
                value={formatPrice(totalSpent)}
                tone="text-blue-600"
              />
            </dl>
          )}

          {firstOrder && (
            <p className="mt-4 text-sm text-slate-500">
              First reservation {formatDateTime(firstOrder.placedAt)}.
            </p>
          )}
        </section>

        {/* ------------------------------------------------------ actions -- */}
        {isAdmin && (
          <section className="mt-6 rounded-2xl border border-slate-900 bg-slate-900 p-6 text-white shadow-sm">
            <h2 className="text-lg font-bold">Administrator</h2>
            <p className="mt-1 text-sm text-slate-300">
              This account can manage products, sales, orders, and users.
            </p>
            <ButtonLink
              href="/admin"
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              Open admin console
            </ButtonLink>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Sign out</h2>
          <p className="mt-1 text-sm text-slate-600">
            Clears the session cookie on this browser. Your cart is stored
            separately and will still be here when you come back.
          </p>

          {/*
            A form posting to a Server Action, not a link. The session lives in
            an httpOnly cookie that only the server can clear, and a GET that
            destroyed a session would fire on any prefetch or crawler.
          */}
          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Sign out
            </button>
          </form>
        </section>
      </div>
    </Container>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-3.5">
      <dt className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd
        className={`min-w-0 flex-1 break-all text-sm text-slate-900 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {/* An absent claim is stated, not left blank — a blank row reads as a
            rendering fault rather than as "the token does not carry this". */}
        {value ?? <span className="text-slate-400">Not set</span>}
      </dd>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "text-slate-900",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className={`mt-1.5 text-2xl font-bold ${tone}`}>{value}</dd>
    </div>
  );
}

/** Two letters for the avatar. Mirrors the navbar's rule so they never differ. */
function initialsFor(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "?";

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

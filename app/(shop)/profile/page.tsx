import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { logout } from "@/app/actions/auth";
import { formatDateTime, formatPrice } from "@/app/lib/format";
import { listMyOrders } from "@/app/lib/orders";
import { getSessionClaims } from "@/app/lib/session";
import { Badge } from "@/components/ui/Badge";
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
    <Container className="pb-22 pt-14">
      <div className="mx-auto max-w-205">
        <h1 className="text-[clamp(40px,5vw,60px)] tracking-[-0.03em]">
          Profile
        </h1>
        <p className="fx-muted mt-2">
          The account this browser is signed in as.
        </p>

        {/* ----------------------------------------------------- identity -- */}
        <section className="mt-9">
          <div className="flex flex-wrap items-center gap-5 border-y-2 border-fx-divider py-6">
            <span
              aria-hidden="true"
              className="grid h-16 w-16 shrink-0 place-items-center bg-fx-ink font-heading text-lg font-extrabold text-fx-bg"
            >
              {initialsFor(claims.name, claims.email)}
            </span>

            <div className="min-w-0">
              <p className="truncate font-heading text-2xl font-extrabold">
                {claims.name ?? "Your account"}
              </p>
              <p className="fx-muted truncate text-sm">{claims.email}</p>

              <div className="mt-2">
                <Badge tone={isAdmin ? "accent" : "neutral"}>
                  {claims.role ?? "CUSTOMER"}
                </Badge>
              </div>
            </div>
          </div>

          <dl>
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
        <section className="mt-11">
          <div className="flex items-baseline justify-between border-b-2 border-fx-divider pb-3">
            <h2 className="fx-eyebrow">Activity</h2>
            <ButtonLink href="/orders" variant="ghost">
              All orders →
            </ButtonLink>
          </div>

          {/*
            A failed orders call degrades to a notice rather than taking the
            page down. The identity above is why someone came here and it is
            still perfectly good.
          */}
          {!orders.ok ? (
            <p className="mt-5 bg-fx-accent-100 px-4 py-3 text-[13px] text-fx-accent-800">
              Your order history could not be loaded. {orders.message}
            </p>
          ) : (
            <dl className="grid grid-cols-3 border-b-2 border-fx-divider">
              <Stat label="Orders placed" value={String(rows.length)} />
              <Stat label="Confirmed" value={String(confirmed.length)} />
              <Stat label="Total spent" value={formatPrice(totalSpent)} />
            </dl>
          )}

          {firstOrder && (
            <p className="fx-muted mt-4 text-sm">
              First reservation {formatDateTime(firstOrder.placedAt)}.
            </p>
          )}
        </section>

        {/* ------------------------------------------------------ actions -- */}
        {isAdmin && (
          <section className="mt-11 bg-fx-ink px-6 py-6 text-fx-bg">
            <h2 className="font-heading text-lg font-extrabold">
              Administrator
            </h2>
            <p className="mt-1 text-sm opacity-80">
              This account can manage products, sales, orders, and users.
            </p>
            <ButtonLink
              href="/admin"
              className="mt-4 bg-fx-bg text-fx-ink hover:bg-fx-neutral-200"
            >
              Open admin console
            </ButtonLink>
          </section>
        )}

        <section className="mt-11 border-t-2 border-fx-divider pt-6">
          <h2 className="font-heading text-lg font-extrabold">Sign out</h2>
          <p className="fx-muted mt-1 text-sm">
            Clears the session cookie on this browser. Your cart is stored
            separately and will still be here when you come back.
          </p>

          {/*
            A form posting to a Server Action, not a link. The session lives in
            an httpOnly cookie that only the server can clear, and a GET that
            destroyed a session would fire on any prefetch or crawler.
          */}
          <form action={logout} className="mt-4">
            <button type="submit" className="fx-btn fx-btn-secondary">
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
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-fx-divider py-3.5">
      <dt className="fx-muted fx-eyebrow w-36 shrink-0 tracking-[0.1em]">
        {label}
      </dt>
      <dd
        className={`min-w-0 flex-1 break-all text-sm ${
          mono ? "fx-mono text-xs" : ""
        }`}
      >
        {/* An absent claim is stated, not left blank — a blank row reads as a
            rendering fault rather than as "the token does not carry this". */}
        {value ?? <span className="fx-muted">Not set</span>}
      </dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-fx-divider px-5 py-6 first:pl-0 last:pr-0 not-first:border-l">
      <dt className="fx-muted fx-eyebrow tracking-[0.12em]">{label}</dt>
      <dd className="mt-2 font-heading text-3xl font-extrabold">{value}</dd>
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logout } from "@/app/actions/auth";
import { useCart } from "@/app/lib/cart-context";
import { ButtonLink } from "@/components/ui/Button";

/**
 * What the server tells the navbar about the current visitor.
 *
 * Display fields only. The session token stays in the httpOnly cookie and never
 * crosses into a Client Component — see the note in `app/(shop)/layout.tsx`.
 * `role` is here to decide whether to draw the console link, never to grant
 * access to it.
 */
export type NavSession = {
  name?: string;
  email?: string;
  role?: "CUSTOMER" | "ADMIN";
} | null;

/** Routes that only mean something once there is a session behind them. */
const links = [
  { href: "/", label: "Home", auth: false },
  { href: "/sales", label: "Flash Sales", auth: false },
  { href: "/orders", label: "Orders", auth: true },
  { href: "/dashboard", label: "Dashboard", auth: true },
];

export default function Navbar({ session = null }: { session?: NavSession }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const signedIn = session !== null;
  const visibleLinks = links.filter((link) => !link.auth || signedIn);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3.5">

        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-orange-400 to-orange-600 text-base shadow-sm shadow-orange-500/30"
          >
            ⚡
          </span>
          FlashX
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <CartLink />

          {signedIn ? (
            <ProfileMenu session={session} pathname={pathname} />
          ) : (
            <ButtonLink href="/login" size="sm" className="hidden sm:inline-flex">
              Sign in
            </ButtonLink>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d={menuOpen ? "M5 5l10 10M15 5L5 15" : "M3 6h14M3 10h14M3 14h14"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-3">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // Closed on click rather than in an effect on pathname: tapping
                // the link the user is already on must still dismiss the menu.
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {signedIn && (
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Profile
              </Link>
            )}

            {session?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white"
              >
                <ShieldIcon />
                Admin console
              </Link>
            )}

            {signedIn ? (
              <form action={logout} className="mt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </form>
            ) : (
              <ButtonLink
                href="/login"
                size="md"
                fullWidth
                onClick={() => setMenuOpen(false)}
                className="mt-2 sm:hidden"
              >
                Sign in
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function CartLink() {
  const { itemCount, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={
        hydrated && itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"
      }
      className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M2.5 2.5h2l1.2 9.2a1.5 1.5 0 0 0 1.5 1.3h7a1.5 1.5 0 0 0 1.5-1.2l1.1-5.8H5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="8" cy="16.5" r="1.2" fill="currentColor" />
        <circle cx="14.5" cy="16.5" r="1.2" fill="currentColor" />
      </svg>

      {/*
        Rendered only after hydration. The server has no localStorage, so drawing
        a count on the first pass would mismatch the server's empty markup.
      */}
      {hydrated && itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}

/**
 * The signed-in replacement for the Sign in button.
 *
 * Collapsed to an initials avatar rather than a name: the header already
 * carries a brand, four links, and a cart, and a full name pushes the nav into
 * a second line on a laptop. The name is one click away in the panel, which is
 * where someone checking *which* account they are on will look anyway.
 */
function ProfileMenu({
  session,
  pathname,
}: {
  session: NonNullable<NavSession>;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close on navigation, adjusted during render rather than in an effect —
  // the same pattern as the admin drawer. React re-runs this component with
  // the corrected state and never commits the stale frame, so the panel does
  // not hang open over the page just requested. Covers back/forward too,
  // which an onClick on each link would miss.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isAdmin = session.role === "ADMIN";
  const label = session.name?.trim() || session.email?.trim() || "Account";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-slate-700 to-slate-900 text-xs font-bold text-white ring-2 ring-transparent transition-all hover:ring-slate-300 focus-visible:outline-none focus-visible:ring-slate-400"
      >
        {initialsFor(session)}
      </button>

      {open && (
        <>
          {/*
            Catches the click that dismisses the panel. A backdrop element
            rather than a document listener in an effect: it cannot leak a
            listener on unmount, and it stops the same click from also
            activating whatever sits underneath.
          */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-900">
                {session.name ?? "Your account"}
              </p>
              {session.email && (
                <p className="truncate text-xs text-slate-500">{session.email}</p>
              )}
              {isAdmin && (
                <span className="mt-1.5 inline-flex items-center rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Admin
                </span>
              )}
            </div>

            <div className="p-1.5">
              {isAdmin && (
                // First in the list, and the only styled item: an admin
                // arriving at the storefront is usually en route to the
                // console.
                <Link
                  href="/admin"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <ShieldIcon />
                  Admin console
                </Link>
              )}

              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile
              </Link>

              <Link
                href="/dashboard"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>

              <Link
                href="/orders"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                My orders
              </Link>
            </div>

            {/*
              A form posting to a Server Action, not a link. Signing out clears
              an httpOnly cookie, which only the server can do, and a GET that
              destroys a session would be triggerable by any prefetch or
              <img> tag on the page.
            */}
            <form action={logout} className="border-t border-slate-100 p-1.5">
              <button
                type="submit"
                role="menuitem"
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Two letters for the avatar: initials from a full name, otherwise the start of
 * whatever identifier there is. Never empty — a blank circle reads as a broken
 * image rather than as an account.
 */
function initialsFor(session: NonNullable<NavSession>) {
  const source = session.name?.trim() || session.email?.trim() || "";
  if (!source) return "?";

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 2.5l6 2.2v4.6c0 3.6-2.4 6.9-6 8.2-3.6-1.3-6-4.6-6-8.2V4.7l6-2.2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M7.5 10l1.8 1.8L13 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

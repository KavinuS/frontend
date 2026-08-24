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

/**
 * The storefront header.
 *
 * Full-bleed rather than sitting inside the 1240px measure: the design pins the
 * brand and the account controls to the window edges so the rule under them
 * reads as the top edge of the page, not as another boxed element on it.
 *
 * The current route is marked with a small accent square to the left of the
 * label rather than a background or an underline. Nothing else in the system
 * has a filled pill, and colouring the label alone would be the only
 * non-black text in the row.
 */
export default function Navbar({ session = null }: { session?: NavSession }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const signedIn = session !== null;
  const visibleLinks = links.filter((link) => !link.auth || signedIn);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fx-nav sticky top-0 z-40 bg-fx-bg px-6 py-3.5 md:px-10">
      <Link
        href="/"
        className="mr-auto flex items-center gap-2.5 font-heading text-lg font-extrabold tracking-[0.02em] text-fx-ink"
      >
        <span aria-hidden="true" className="block h-3.5 w-3.5 bg-fx-accent" />
        FLASHX
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className="flex items-center gap-[7px] text-sm text-fx-ink hover:text-fx-accent"
          >
            {isActive(link.href) && (
              <span
                aria-hidden="true"
                className="block h-[7px] w-[7px] bg-fx-accent"
              />
            )}
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3.5 md:ml-7">
        <CartLink />

        {signedIn ? (
          <ProfileMenu session={session} pathname={pathname} />
        ) : (
          <ButtonLink href="/login" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          className="p-1 text-fx-ink md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d={menuOpen ? "M5 5l10 10M15 5L5 15" : "M3 6h14M3 10h14M3 14h14"}
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b-2 border-fx-divider bg-fx-bg px-6 pb-4 md:hidden"
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              // Closed on click rather than in an effect on pathname: tapping
              // the link the user is already on must still dismiss the menu.
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(link.href) ? "page" : undefined}
              className="flex items-center gap-[7px] border-b border-fx-divider py-3.5 text-sm"
            >
              {isActive(link.href) && (
                <span
                  aria-hidden="true"
                  className="block h-[7px] w-[7px] bg-fx-accent"
                />
              )}
              {link.label}
            </Link>
          ))}

          {signedIn && (
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="block border-b border-fx-divider py-3.5 text-sm"
            >
              Profile
            </Link>
          )}

          {session?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="block border-b border-fx-divider py-3.5 text-sm text-fx-accent"
            >
              Admin console
            </Link>
          )}

          {signedIn ? (
            <form action={logout} className="mt-4">
              <button type="submit" className="fx-btn fx-btn-secondary w-full">
                Sign out
              </button>
            </form>
          ) : (
            <ButtonLink
              href="/login"
              fullWidth
              onClick={() => setMenuOpen(false)}
              className="mt-4 justify-center sm:hidden"
            >
              Sign in
            </ButtonLink>
          )}
        </div>
      )}
    </header>
  );
}

/**
 * "Cart / 3" — a word and a number, not a badged icon.
 *
 * The count is part of the label rather than a superscript bubble, which is the
 * only shape in the header that would need a border radius. It also reads
 * correctly when there is nothing in it: "Cart" alone, with no empty circle.
 */
function CartLink() {
  const { itemCount, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={
        hydrated && itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"
      }
      className="text-[13px] uppercase tracking-[0.06em] text-fx-ink hover:text-fx-accent"
    >
      Cart
      {/*
        Rendered only after hydration. The server has no localStorage, so drawing
        a count on the first pass would mismatch the server's empty markup.
      */}
      {hydrated && itemCount > 0 && ` / ${itemCount}`}
    </Link>
  );
}

/**
 * The signed-in replacement for the Sign in button.
 *
 * Collapsed to an initials square rather than a name: the header already
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
        className="flex h-9 w-9 items-center justify-center bg-fx-ink font-heading text-[11px] font-extrabold text-fx-bg"
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
            className="absolute right-0 z-50 mt-3 w-60 border-2 border-fx-divider bg-fx-bg"
          >
            <div className="border-b border-fx-divider px-4 py-3">
              <p className="truncate font-heading text-sm font-extrabold">
                {session.name ?? "Your account"}
              </p>
              {session.email && (
                <p className="fx-muted truncate text-xs">{session.email}</p>
              )}
              {isAdmin && (
                <span className="fx-tag fx-tag-accent mt-2">Admin</span>
              )}
            </div>

            <div className="px-4 py-2">
              {isAdmin && (
                // First in the list, and the only accented item: an admin
                // arriving at the storefront is usually en route to the
                // console.
                <Link
                  href="/admin"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block border-b border-fx-divider py-2.5 text-sm text-fx-accent"
                >
                  Admin console
                </Link>
              )}

              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block border-b border-fx-divider py-2.5 text-sm"
              >
                Profile
              </Link>

              <Link
                href="/dashboard"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block border-b border-fx-divider py-2.5 text-sm"
              >
                Dashboard
              </Link>

              <Link
                href="/orders"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm"
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
            <form action={logout} className="border-t border-fx-divider">
              <button
                type="submit"
                role="menuitem"
                className="fx-btn fx-btn-ghost w-full justify-start px-4 py-3"
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
 * whatever identifier there is. Never empty — a blank square reads as a broken
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

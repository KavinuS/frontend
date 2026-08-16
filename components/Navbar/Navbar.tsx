"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/app/lib/cart-context";
import { ButtonLink } from "@/components/ui/Button";

const links = [
  { href: "/", label: "Home" },
  { href: "/sales", label: "Flash Sales" },
  { href: "/orders", label: "Orders" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
          {links.map((link) => (
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

          <ButtonLink href="/login" size="sm" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>

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
            {links.map((link) => (
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

            <ButtonLink
              href="/login"
              size="md"
              fullWidth
              onClick={() => setMenuOpen(false)}
              className="mt-2 sm:hidden"
            >
              Sign in
            </ButtonLink>
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

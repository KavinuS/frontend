"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logout } from "@/app/actions/auth";
import {
  BoltIcon,
  BoxIcon,
  CloseIcon,
  DashboardIcon,
  MenuIcon,
  ReceiptIcon,
  StoreIcon,
  UsersIcon,
} from "@/components/admin/icons";

/**
 * The console frame: dark rail, light workspace.
 *
 * The colour inversion against the storefront is doing a job. This panel can
 * end a live sale and change who has admin rights, and it should never be
 * mistakable for the shop at a glance — particularly when both are open in
 * adjacent tabs.
 *
 * A Client Component because the active nav item is derived from the current
 * path and the mobile drawer holds open/closed state. `children` arrives
 * already rendered on the server, so nothing under it is pulled into the
 * client bundle by this boundary.
 */

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: DashboardIcon, exact: true },
  { href: "/admin/products", label: "Products", Icon: BoxIcon, exact: false },
  { href: "/admin/sales", label: "Flash sales", Icon: BoltIcon, exact: false },
  { href: "/admin/orders", label: "Orders", Icon: ReceiptIcon, exact: false },
  { href: "/admin/users", label: "Users", Icon: UsersIcon, exact: false },
] as const;

export function AdminShell({
  name,
  email,
  children,
}: {
  name?: string;
  email?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close on navigation. Without this the drawer stays open over the page the
  // user just asked for, which reads as a broken link on a phone.
  //
  // Adjusted during render rather than in an effect. React re-runs this
  // component immediately with the corrected state and never commits the stale
  // frame, so there is no flash of an open drawer over the new page — and no
  // cascading second render pass, which is what the effect version costs.
  // Covers back/forward navigation too, which an onClick on each link would not.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawerOpen(false);
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map(({ href, label, Icon, exact }) => {
        const active = isActive(href, exact);

        return (
          <Link
            key={href}
            href={href}
            // aria-current is what tells a screen reader which page this is;
            // the colour change alone conveys nothing without sight.
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white shadow-sm shadow-blue-950/40"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <Link
        href="/"
        className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <StoreIcon className="h-5 w-5 shrink-0" />
        View storefront
      </Link>

      <div className="rounded-xl bg-white/5 p-3">
        <p className="truncate text-sm font-semibold text-white">
          {name ?? "Administrator"}
        </p>
        <p className="truncate text-xs text-slate-400">{email}</p>

        <form action={logout} className="mt-2.5">
          <button
            type="submit"
            className="w-full rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/20 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  const brand = (
    <div className="flex items-center gap-2.5 px-6 py-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-orange-600 text-lg shadow-lg shadow-orange-900/30">
        ⚡
      </span>
      <span>
        <span className="block text-base font-bold leading-tight text-white">
          FlashX
        </span>
        <span className="block text-[11px] font-semibold uppercase tracking-widest text-orange-400">
          Ops Console
        </span>
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop rail. Fixed so long tables scroll under a stationary nav. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Mobile drawer. Rendered only when open so its links stay out of the
          tab order while it is hidden. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close navigation"
              >
                <CloseIcon />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
          <span className="text-sm font-bold text-slate-900">
            FlashX <span className="text-orange-500">Ops</span>
          </span>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

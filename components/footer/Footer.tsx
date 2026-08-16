import Link from "next/link";

import { Container } from "@/components/ui/Section";

const groups = [
  {
    heading: "Shop",
    links: [
      { href: "/sales", label: "Flash Sales" },
      { href: "/cart", label: "Cart" },
      { href: "/orders", label: "My Orders" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <Container className="py-14">

        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">

          <div>
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

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              A high-concurrency flash sale and inventory engine. Atomic Redis
              reservations, asynchronous order persistence, zero overselling.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold text-slate-900">
                {group.heading}
              </h3>

              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © 2026 FlashX. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Built with Next.js 16, React 19, and Tailwind CSS 4.
          </p>
        </div>

      </Container>
    </footer>
  );
}

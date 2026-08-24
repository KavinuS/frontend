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

/**
 * Four columns under a 2px rule: the brand statement takes one and a half, the
 * three link groups share the rest. Each group heading is ruled off rather than
 * boxed, which is the same device the page headings above use — so the footer
 * reads as the last section of the page rather than as a separate slab.
 */
export default function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-fx-divider bg-fx-bg pb-8 pt-14">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 font-heading text-lg font-extrabold text-fx-ink"
            >
              <span
                aria-hidden="true"
                className="block h-3.5 w-3.5 bg-fx-accent"
              />
              FLASHX
            </Link>

            <p className="fx-muted mt-4 max-w-[34ch] text-sm">
              A high-concurrency flash sale and inventory engine. Atomic Redis
              reservations, asynchronous order persistence, zero overselling.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.heading}>
              <h2 className="fx-eyebrow border-b-2 border-fx-divider pb-3">
                {group.heading}
              </h2>

              <ul className="mt-3.5 grid gap-2.5 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-fx-ink hover:text-fx-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-6 border-t border-fx-divider pt-4.5 text-xs">
          <span className="fx-muted">© 2026 FlashX. All rights reserved.</span>
          <span className="fx-muted">
            Built with Next.js 16, React 19, and Tailwind CSS 4.
          </span>
        </div>
      </Container>
    </footer>
  );
}

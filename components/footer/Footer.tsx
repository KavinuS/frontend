import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/sales", label: "Flash Sales" },
  { href: "/orders", label: "Orders" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">

      <div className="mx-auto max-w-5xl px-6 py-10">

        <div className="flex flex-col justify-between gap-8 md:flex-row">

          {/* Project Name */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              ⚡ FlashX
            </h2>

            <p className="mt-2 max-w-md text-slate-600">
              High-Concurrency Flash Sale &amp; Inventory Engine
              built for fast and reliable flash sale processing.
            </p>
          </div>


          {/* Navigation */}
          <div>
            <h3 className="mb-3 font-semibold text-slate-900">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2">

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-600 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}

            </div>
          </div>

        </div>


        {/* Bottom Section */}
        <div className="mt-8 border-t border-slate-200 pt-6 text-center">

          <p className="text-sm text-slate-500">
            © 2026 FlashX. All rights reserved.
          </p>

        </div>

      </div>

    </footer>
  );
}

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">

      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

        <Link href="/" className="text-2xl font-bold text-slate-900">
          ⚡ FlashX
        </Link>

        <div className="flex items-center gap-8">

          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Home
          </Link>

          <Link
            href="/sales"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Flash Sales
          </Link>

          <Link
            href="/orders"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Orders
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Login
          </Link>

        </div>
      </div>
    </nav>
  );
}

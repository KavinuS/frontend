const stats = [
  { value: "5,000+", label: "Target RPS" },
  { value: "< 15ms", label: "Checkout latency" },
  { value: "100%", label: "Stock accuracy" },
  { value: "0", label: "Oversells" },
];

export default function Hero() {
  return (
    <section className="border-b border-slate-200 bg-white">

      <div className="mx-auto max-w-5xl px-6 py-24 text-center">

        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-600 ring-1 ring-orange-200">
          ⚡ FLASH SALE IS LIVE
        </p>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
          Limited Stock.
          <br />
          Thousands of Buyers.
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600">
          Grab the deal before the inventory disappears. Every reservation is
          atomic, so the counter you see is the counter that counts.
        </p>

        <a
          href="#live-deals"
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700"
        >
          Shop Flash Sale
        </a>

        {/* Engineering targets — see docs/PROJECT-REPORT.md for how these are measured */}
        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5"
            >
              <dt className="text-2xl font-bold text-blue-600">{stat.value}</dt>
              <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>

      </div>
    </section>
  );
}

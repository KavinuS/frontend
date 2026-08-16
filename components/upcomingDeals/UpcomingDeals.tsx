const upcoming = [
  { name: "Gaming Laptop", startsIn: "Starts Tomorrow", discount: "Up to 40% OFF" },
  { name: "Smart Watch", startsIn: "Starts in 2 Days", discount: "Up to 35% OFF" },
  { name: "Gaming Console", startsIn: "Starts in 3 Days", discount: "Up to 30% OFF" },
];

export default function UpcomingDeals() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">

      {/* Section title */}
      <div className="mb-8">
        <p className="mb-2 font-semibold text-orange-600">
          COMING SOON
        </p>

        <h2 className="text-3xl font-bold text-slate-900">
          Upcoming Deals
        </h2>
      </div>


      {/* Deals container */}
      <div className="grid gap-6 md:grid-cols-3">

        {upcoming.map((deal) => (
          <div
            key={deal.name}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="mb-5 flex h-40 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400">
              Product Image
            </div>

            <h3 className="mb-2 text-xl font-bold text-slate-900">
              {deal.name}
            </h3>

            <p className="mb-4 text-slate-500">
              {deal.startsIn}
            </p>

            <p className="font-semibold text-orange-600">
              {deal.discount}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

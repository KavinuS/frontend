/*
 * Placeholder data. Replace with a live poll of the backend health endpoint
 * once the flash-sale service exists — see docs/PROJECT-REPORT.md, Phase 1.
 */
const services = [
  {
    name: "Flash Sale",
    state: "Active",
    detail: "Customers can currently place orders.",
  },
  {
    name: "Inventory",
    state: "Online",
    detail: "Real-time inventory system is available.",
  },
  {
    name: "Order Processing",
    state: "Operational",
    detail: "Orders are being processed normally.",
  },
];

export default function SystemStatus() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">

      {/* Section Heading */}
      <div className="mb-8">
        <p className="mb-2 font-semibold text-orange-600">
          LIVE SYSTEM
        </p>

        <h2 className="text-3xl font-bold text-slate-900">
          System Status
        </h2>
      </div>


      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-3">

        {services.map((service) => (
          <div
            key={service.name}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="mb-3 flex items-center gap-3">

              <span className="h-3 w-3 rounded-full bg-green-500" />

              <h3 className="text-lg font-bold text-slate-900">
                {service.name}
              </h3>

            </div>

            <p className="font-semibold text-green-600">
              {service.state}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {service.detail}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

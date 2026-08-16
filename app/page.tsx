import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/hero/Hero";
import UpcomingDeals from "@/components/upcomingDeals/UpcomingDeals";
import SystemStatus from "@/components/systemStatus/SystemStatus";
import FlashSaleCard from "@/components/flashSalesCard/FlashSalesCard";
import Footer from "@/components/footer/Footer";
import { products } from "@/Data/product";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-slate-900">

      <Navbar />

      <Hero />

      {/* Live deals — static seed data for now, backed by the API in Phase 1 */}
      <section id="live-deals" className="mx-auto w-full max-w-5xl px-6 py-20">

        <div className="mb-8">
          <p className="mb-2 font-semibold text-orange-600">
            LIVE NOW
          </p>

          <h2 className="text-3xl font-bold">
            Flash Deals
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <FlashSaleCard key={product.id} product={product} />
          ))}
        </div>

      </section>

      <UpcomingDeals />

      <SystemStatus />

      <Footer />

    </main>
  );
}

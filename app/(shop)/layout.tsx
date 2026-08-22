import { listFlashSales } from "@/app/lib/catalog";
import { CartProvider } from "@/app/lib/cart-context";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/Navbar/Navbar";

/**
 * Chrome shared by every storefront page.
 *
 * The auth screens sit in `(auth)` precisely so they *don't* get this — a
 * sign-in page with a cart badge in the header is a distraction, and it keeps
 * the cart provider off routes that have no use for it.
 *
 * Orders now come from the backend, scoped to the JWT subject, so there is no
 * client-side order store to provide.
 *
 * The catalogue is fetched here rather than in each page because the cart needs
 * it on every route — a cart badge in the navbar has to join stored skus
 * against live prices and stock. Fetching it once in the layout means one
 * gateway call per navigation instead of one per consumer.
 */
export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const catalogue = await listFlashSales();

  return (
    // An unreachable backend yields an empty catalogue rather than a thrown
    // layout: the chrome still renders, the cart reports itself empty, and the
    // page inside says what actually went wrong.
    <CartProvider catalogue={catalogue.ok ? catalogue.data : []}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </CartProvider>
  );
}

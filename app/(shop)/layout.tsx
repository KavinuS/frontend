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
 * Orders are read straight from their store (no provider): unlike the cart,
 * nothing in the shared chrome subscribes to them, so there is no repeated
 * derivation worth hoisting.
 */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </CartProvider>
  );
}

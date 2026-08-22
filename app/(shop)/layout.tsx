import { listFlashSales } from "@/app/lib/catalog";
import { CartProvider } from "@/app/lib/cart-context";
import { getSessionClaims } from "@/app/lib/session";
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
 *
 * ## Why the navbar is handed a session instead of reading one
 *
 * `Navbar` is a Client Component and the session lives in an httpOnly cookie,
 * which is unreadable from the browser by design. Reading the claims here and
 * passing them down is the only direction that works.
 *
 * Only display fields cross the boundary — name, email, role. The token itself
 * deliberately does not: anything passed to a Client Component is serialised
 * into the RSC payload and shipped to the browser, which would undo the point
 * of the httpOnly cookie. The role travelling over is fine, since it decides
 * what to draw and never what is allowed.
 */
export default async function ShopLayout({ children }: LayoutProps<"/">) {
  // Concurrent: neither depends on the other, and the catalogue call is a
  // gateway round trip that shouldn't wait on a local cookie decode.
  const [catalogue, claims] = await Promise.all([
    listFlashSales(),
    getSessionClaims(),
  ]);

  return (
    // An unreachable backend yields an empty catalogue rather than a thrown
    // layout: the chrome still renders, the cart reports itself empty, and the
    // page inside says what actually went wrong.
    <CartProvider catalogue={catalogue.ok ? catalogue.data : []}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar
          session={
            claims && {
              name: claims.name,
              email: claims.email,
              role: claims.role,
            }
          }
        />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </CartProvider>
  );
}

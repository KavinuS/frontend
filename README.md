# FlashX — Frontend

The Next.js storefront for [FlashX](../README.md), the high-concurrency flash sale engine.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, and TypeScript.

> ⚠️ **Heads up:** this is Next.js 16, which has breaking changes from earlier versions.
> The bundled docs in `node_modules/next/dist/docs/` are authoritative — check them before
> reaching for an API you remember from Next 14.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see Authentication below
npm run dev
```

Open <http://localhost:3000>.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (also typechecks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## Structure

Two route groups. `(shop)` shares the navbar/footer chrome; `(auth)` deliberately
does not, so sign-in isn't cluttered with a cart badge.

```
app/
├── layout.tsx              # root layout, fonts, metadata
├── globals.css             # design tokens, keyframes, reduced-motion
├── not-found.tsx           # 404 (carries its own chrome — any group can hit it)
├── actions/auth.ts         # Server Actions: register, login, Google, logout
├── lib/
│   ├── definitions.ts      # Zod schemas + AuthFormState
│   ├── api.ts              # backend client (server-side only)
│   ├── session.ts          # httpOnly session cookie helpers
│   ├── format.ts           # currency / date / countdown formatters
│   ├── local-store.ts      # useSyncExternalStore over localStorage
│   ├── cart-store.ts       # cart storage + pure quantity/stock rules
│   ├── cart-context.tsx    # CartProvider + useCart()
│   └── orders-store.ts     # useOrders()
├── (shop)/                 # navbar + footer
│   ├── page.tsx            # home
│   ├── sales/              # listing + [sku] detail (prerendered per product)
│   ├── cart/               # cart
│   ├── checkout/           # checkout
│   ├── orders/             # list + [id] detail with status timeline
│   ├── dashboard/          # account overview
│   ├── terms/ privacy/     # legal stubs
└── (auth)/                 # standalone split-screen shell
    ├── login/ register/
    └── forgot-password/    # stub

components/
├── ui/                     # Button, Badge, StockBar, Section primitives
├── Navbar/ footer/ hero/   # chrome
├── flashSalesCard/ upcomingDeals/ systemStatus/
├── cart/                   # AddToCartButton, CartView, OrderSummary
├── checkout/ orders/ dashboard/ sales/ legal/
└── auth/                   # AuthShell, Login/RegisterForm, fields, Google button

Data/product.tsx            # seed catalogue — replaced by the API in Phase 1
Data/orders.tsx             # demo order history, seeded on first visit
types/product.tsx           # Product + SaleStatus
types/order.tsx             # Order, OrderLine, OrderStatus
```

---

## Theming

The storefront runs on **Modernist**, the design system the Claude Design project
`FlashX Storefront.dc.html` is drawn against. It is ported into `app/globals.css` under an
`fx-` namespace, so it can sit beside the admin console's Tailwind/slate palette without
either reaching into the other.

The look in one line: off-white ground, near-black ink, a single hot red accent, Archivo at
weight 800 for every heading and control label, **zero corner radius**, and hairline rules
instead of cards and shadows.

FlashX is a **fixed light theme**. The `create-next-app` `prefers-color-scheme: dark`
override was **deliberately removed** — without that, the body would flip to near-black on
machines set to dark mode while the component palette stayed light, producing white cards
on a black page. If you want real dark mode later, add it as a full palette swap rather
than restoring that block.

### Where the tokens live

`@theme` in `globals.css` is the single source of truth. Retune there and both the Tailwind
utilities and the ported component classes follow.

| Role | Token | Utility |
|---|---|---|
| Page ground | `--color-fx-bg` `#f3f2f2` | `bg-fx-bg` |
| Inset surface | `--color-fx-surface` `#eae9e9` | `bg-fx-surface` |
| Ink | `--color-fx-ink` `#201e1d` | `text-fx-ink` |
| Accent | `--color-fx-accent` `#ec3013` | `bg-fx-accent` / `text-fx-accent` |
| Accent wash / deep | `--color-fx-accent-100` … `-800` | `bg-fx-accent-100`, `text-fx-accent-800` |
| Hairline | `--color-fx-divider` | `border-fx-divider` |
| Muted text | `--color-fx-muted` | `.fx-muted` |
| Heading face | `--font-heading` (Archivo 800) | `font-heading` |

**Red is rationed.** It marks the current nav item, the live square, scarce stock, an
in-flight order, and the primary action — nothing else. The one exception is the auth
screen's left panel, which fills a whole surface with it because there is nothing on that
screen to compete with.

### Opting in: `.fx-scope`

The element-level rules (type scale, focus ring, selection colour) are scoped to
`.fx-scope`, not stated on `body`. Anything outside the shop layout that needs the system
has to add the class itself — `app/(shop)/layout.tsx`, `components/auth/AuthShell.tsx` and
`app/not-found.tsx` all do. The admin console deliberately does not.

### Component classes

Ported from the design system's own stylesheet, in Tailwind's `components` layer so plain
utilities still override them without `!important`:

`.fx-btn` (+ `-primary` / `-secondary` / `-ghost` / `-block`), `.fx-input`, `.fx-field`,
`.fx-seg` + `.fx-seg-opt`, `.fx-tag` (+ `-accent` / `-neutral` / `-outline`), `.fx-nav`,
`.fx-table`, `.fx-eyebrow`, `.fx-muted`, `.fx-mono`.

`.fx-table` is prefixed rather than the source's `.table`, which would collide with
Tailwind's `display: table` utility of the same name.

### React primitives

Don't hand-roll buttons, badges, or section headers — `components/ui/` owns them, so a
`<button>` and a `<Link>` that look alike can't drift apart:

- **`Button` / `ButtonLink`** — variants `primary`, `flash`, `secondary`, `ghost`,
  `danger`. `primary` and `flash` are the same button and `danger` is ghost-accent: the
  system has one accent, so there is no second colour to promote or warn with. Pick the
  element by meaning: `Button` acts, `ButtonLink` navigates.
- **`Badge`, `SaleStatusBadge`, `OrderStatusBadge`, `LiveDot`** — three tones only
  (`accent`, `neutral`, `outline`), mapped per domain in one table rather than per call
  site. Note the inversion: *Processing* is accent and *Confirmed* is neutral, because the
  row worth a second look is the one still in flight.
- **`StockBar`** — binary, not a traffic light: ink while there is room, accent under 15%,
  and the label swaps from `128 / 500` to `Only 3 left` at the same moment.
- **`Container`, `Rule`, `SectionHeading`, `EmptyState`** — 1240px measure, 40px gutter,
  and the 2px rule that opens and closes every block.
- **`Thumb`** — the product image slot. Swap the inner span for an `<Image>` the day the
  catalogue grows a photo column; nothing outside that file cares what fills the block.
- **`QuantityStepper`** — shared by the detail page and the cart rows, so the two can't
  disagree about the ceiling.

Motion is a short set of entrances declared as `--animate-fx-*` tokens: `fx-lift` for a
page heading, `fx-rule-x` for the rule under it, `fx-bar` for a stock fill, `fx-dot` for a
live square, `fx-wipe` for a hero. All decorative, so the global `prefers-reduced-motion`
block switches them off without losing information.

**Tailwind v4 note:** gradients are `bg-linear-to-*`, not the v3 `bg-gradient-to-*` — though
the storefront no longer uses any.

---

## Authentication

`/login` and `/register` support **email + password** and **Continue with Google**.

Credentials are submitted to **Server Actions** (`app/actions/auth.ts`), so the password
never enters the client bundle. Validation is [Zod](https://zod.dev) running on the server
(`app/lib/definitions.ts`) — both forms set `noValidate`, so those schemas are the single
source of truth for what counts as valid. Errors come back through `useActionState` and
render inline under each field.

### Backend contract

Set `API_BASE_URL` (server-side only — deliberately *not* `NEXT_PUBLIC_`) to the
Spring Boot / NestJS backend. The frontend expects:

| Endpoint | Request | Success | Failure |
|---|---|---|---|
| `POST /api/v1/auth/register` | `{ name, email, password }` | `201 { token, expiresIn? }` | `409 { message }` if email taken |
| `POST /api/v1/auth/login` | `{ email, password }` | `200 { token, expiresIn? }` | `401` → generic "Incorrect email or password." |
| `GET /api/v1/auth/oauth2/google` | — | `302` to Google, then back with the session set | — |

On success the token is stored in an `httpOnly`, `sameSite=lax` cookie (`flashx_session`)
and the user is redirected to `/dashboard`.

**Google OAuth is handled entirely by the backend.** The client secret and the
code-for-token exchange must never live in a Next.js bundle — the frontend only redirects
the browser to the backend's OAuth entry point.

### Before the backend exists

Everything renders and validates with `API_BASE_URL` unset. The forms catch every
validation error locally; only the final network call fails, with an explicit
"backend is not configured" message rather than a fake success. The Google button
renders disabled.

> Note: the pages are statically prerendered, so whether the Google button starts enabled
> is decided when the page is rendered. Set `API_BASE_URL` at build time as well as
> runtime, or mark the routes dynamic if you need it resolved per request.

---

## Cart and orders

Both live in **localStorage**. Three layers, each with one job:

| File | Role |
|---|---|
| `app/lib/local-store.ts` | Generic `useSyncExternalStore` adapter over localStorage |
| `app/lib/cart-store.ts` | Cart storage + the **pure** rules (`addItem`, `setQuantity`, `toLines`, `limitFor`) |
| `app/lib/cart-context.tsx` | `CartProvider` + `useCart()` |

`CartProvider` (mounted in the `(shop)` layout) subscribes **once** and hands derived lines
and totals down through context, so the navbar badge, cards, cart, and checkout share one
subscription and one `toLines` pass instead of each recomputing it.

Underneath, the store stays a `useSyncExternalStore` source rather than `useState` +
`useEffect`: reading localStorage in an effect is a cascading render (React 19's
`set-state-in-effect` rule rejects it) and would lose cross-tab sync. **Context is the
distribution mechanism; the store is the source of truth.** Keeping the rules pure and
React-free also means the quantity logic can be reasoned about without mounting anything.

### Quantity rules

One ceiling, decided in one place — `limitFor(sku)` returns
`min(MAX_PER_ITEM, remainingStock)`. Every mutation routes through it, so the cards, the
detail-page stepper, the cart's `+` button, and a hand-edited localStorage entry cannot
disagree.

`addItem` returns an `AddResult` rather than `void`, because "added", "added fewer than
you asked for", and "refused" need different words:

| Outcome | What the UI says |
|---|---|
| `ok`, not clamped | "Added ✓" |
| `ok`, `clamped` | "Only N available — your cart now has N." |
| `AT_LIMIT`, stock ≥ cap | "Limit 5 per customer." |
| `AT_LIMIT`, stock < cap | "That's all the stock left (N)." |
| `SOLD_OUT` / `UNKNOWN_SKU` | "This item is sold out." / "no longer available." |

A refused add writes nothing — no re-render, no localStorage round-trip.

Anything read from storage is untrusted: quantities are clamped to today's ceiling
(stock may have fallen since the cart was written) and unknown SKUs are dropped. Sold-out
lines are **kept**, not silently removed — the cart flags them and blocks checkout, which
beats emptying someone's cart without explanation.

The cart holds an **intention to buy, not a reservation**. Stock is claimed atomically at
checkout, which is why a line can go sold-out underneath you.

> `FX-AUDIO-004` is seeded with 3 in stock deliberately — every other product has more
> than `MAX_PER_ITEM`, so without it the stock-limited branch never renders in the demo.

### The simulated async flow

> ⚠️ **`/checkout` fakes the backend.** `placeOrder` mints the correlation ID locally, and
> a **timer** on the order page advances `PENDING_PERSISTENCE → CONFIRMED` after ~2.6s.
>
> It exists so the transition the UI must handle is visible and testable without a
> backend. Phase 3 deletes the timer in `components/orders/OrderDetailView.tsx` and
> subscribes to SSE instead — no other component changes.

---

## Current limitations

The UI is complete; the data layer is not.

- **No API calls anywhere.** Products come from `Data/product.tsx`, orders from
  `Data/orders.tsx` plus localStorage.
- **Checkout is simulated** — see the warning above. Nothing hits
  `POST /api/v1/flash-sale/checkout` yet.
- **Order history is per-browser.** Clearing site data wipes it, and an order placed in
  one browser is invisible in another.
- Stock counts are static — no oversell can actually occur here, because no counter is
  shared. Live updates arrive over SSE in Phase 3.
- `SystemStatus` metrics ("p95 12ms", "0 backlog") are hardcoded, not real health.
- **Nothing guards `/dashboard`.** The session cookie is set at login but no
  proxy/middleware redirects signed-out users away, and the page shows local data rather
  than the signed-in account.
- `logout()` exists in `app/actions/auth.ts` but no UI calls it yet.
- `/forgot-password`, `/terms`, and `/privacy` are honest stubs that say so on the page.
- Sale end times are relative to build time (see the note in `Data/product.tsx`), so a
  long-lived production build will eventually show live sales as ended.

See the [engineering report](../docs/PROJECT-REPORT.md) for the full plan.

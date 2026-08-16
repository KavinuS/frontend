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

```
app/
├── layout.tsx              # root layout, fonts, metadata
├── globals.css             # theme tokens — fixed light theme
├── page.tsx                # home page
└── (auth)/
    ├── login/              # placeholder
    ├── register/           # placeholder
    └── dashboard/          # placeholder

components/
├── Navbar/                 # sticky top nav
├── hero/                   # headline + engineering target strip
├── flashSalesCard/         # live deal card with stock bar
├── upcomingDeals/          # scheduled sales grid
├── systemStatus/           # service health cards
└── footer/

Data/product.tsx            # seed products — replaced by the API in Phase 1
types/product.tsx           # the Product type
```

---

## Theming

FlashX uses a **fixed light theme**. `globals.css` defines `--background` (`#f8fafc`) and
`--foreground` (`#0f172a`) on `:root`.

The `create-next-app` `prefers-color-scheme: dark` override was **deliberately removed** —
without that, the body would flip to near-black on machines set to dark mode while the
component palette stayed light, producing white cards on a black page. If you want real
dark mode later, add it as a full palette swap rather than restoring that block.

Palette conventions used throughout:

| Role | Class |
|---|---|
| Page background | `bg-slate-50` |
| Card surface | `bg-white` + `border-slate-200` + `shadow-sm` |
| Body text | `text-slate-900` |
| Muted text | `text-slate-600` / `text-slate-500` |
| Primary action | `bg-blue-600` |
| Flash sale accent | `text-orange-600` / `bg-orange-500` |
| Price / success | `text-green-600` |

---

## Current limitations

This is a UI shell. There is no data layer yet.

- No API calls anywhere — products come from `Data/product.tsx`.
- The "Buy Now" button has no handler. It gets wired to
  `POST /api/v1/flash-sale/checkout` in Phase 1.
- `SystemStatus` shows hardcoded "Active / Online / Operational" text, not real health.
- Stock counts are static. Live updates arrive over SSE in Phase 3.
- `/login`, `/register`, and `/dashboard` are placeholder pages.

See the [engineering report](../docs/PROJECT-REPORT.md) for the full plan.

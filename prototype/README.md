# Presto Booking — Interactive Prototype

A clickable, end-to-end prototype of the **three booking flows**, built by reusing
the **real design-system components** from this repo's `src/` — no forks, no
restyling, and **zero changes to the library**. Designed at a fixed **1440px**
canvas.

**Live:** https://epprestodesign.github.io/presto-2026/prototype/ (deployed
alongside Storybook; linked from *Getting Started → Introduction*).

## Run it

```bash
cd prototype
cp .env.example .env   # optional: add a Google Maps key (map degrades gracefully without one)
npm run dev            # → http://localhost:6100
```

No install needed: Vite + Vue + Quasar resolve from the parent repo's
`node_modules`, and library components import via the `@lib` alias
(`@lib` → `../src`). `main.js` mirrors `.storybook/preview.js` (same Quasar
plugins, global `<q-*>` registration, same DS stylesheets) so components render
exactly as they do in Storybook.

## The three flows (entered from the Landing booking widget)

| Flow | Widget choice | Path | Checkout |
| --- | --- | --- | --- |
| **Single reservation** | *Book Reservations* | Browse → Choose Your Room → Details → Reserve Room → cart → Checkout | `reservation` (contact → payment → review) |
| **Multiple reservations** | *Book Reservations* | reserve 2+ hotels into the cart → Checkout | `reservations` (per-hotel guest forms, charged) |
| **Group block** | *Hold Rooms for Group or Team* | Browse → Select Rooms → Details → Add to Cart → cart → Checkout | `group` (review → contact+group → review; **no payment, nightly only**) |

Single vs. multiple is **cart-driven**: 1 hotel in the cart → single; 2+ →
multiple. The chosen hotel's **name + city carry through** Browse → Details →
Checkout → Confirmation.

## Deep links (demo / QA)

Any screen is reachable directly (also how the screens were screenshot-verified):

```
?screen=browse&flow=group
?screen=details&flow=reserve&hotel=The%20Grand%20Riverside%20Hotel&city=Overland%20Park
?screen=checkout&flow=reserve&n=2        # multiple-reservations checkout
?screen=confirmation&flow=group&n=2      # group-block confirmation
```
`screen` = landing|browse|details|checkout|confirmation · `flow` = reserve|group ·
`n` = hotels in cart · `hotel`/`city` = active hotel.

## How it works (and why nothing in the library changed)

The library's page components emit **no navigation events** (the widget "Search",
room CTAs, checkout "Book Now", and the cart "Go to checkout" are all inert by
design). So all navigation glue lives here in the prototype layer:

- **`src/store.js`** — the journey state (screen, flow, cart) + the mode mapping
  (each component's `mode`/`flow` prop vocabulary differs — see the cheat-sheet in
  *Getting Started → Architecture*) + the router.
- **`src/App.vue`** — ONE document-level, capture-phase click handler that reads
  the click target and drives navigation. Capture + document scope also catches
  teleported nodes (the cart fly-out). Intercepted seams: `.bw__search`,
  `.hc__cta`, `.rcr__cta`/`.rcg__cta`, `.cf__cta`, checkout "Book Now"/"Hold Group
  Block Now", `.conf__banner-cta`.
- **`src/hotels.js`** — a deterministic 60-hotel database + pure filter/sort
  logic (shared by both booking modes; each hotel has real coordinates).
- **`src/BrowseFilters.vue`** — mirrors the library **FilterRail** exactly (same
  fields/order) but owns the state so filters actually apply (on an Apply button).
- **`src/BrowseMapField.vue`** — the real **HotelMap** + fullscreen dialog driven
  by the 60-hotel dataset (price-pill markers, clustering, radius circle, tooltip
  photo + name → Details link).
- **`src/fixtures.js`** — coherent mock data generators keyed on `{name, city}`.
- **`src/screens/*.vue`** — thin wrappers that render the real page components
  (`LandingPage`, `HotelDetailPage`, `CheckoutPage`, `ConfirmationPage`) with the
  right props for the current mode. Browse is data-driven (see `BrowseScreen.vue`).

## Notes

- The **map** uses `VITE_GOOGLE_MAPS_API_KEY` (see `.env.example`); without a key
  it shows the library's graceful "paste a key" fallback.
- Hotel photos come from the hosted imagery library (`VITE_IMAGERY_URL`).
- Checkout/confirmation **line-items use the library's canonical fixture data**
  (rooms, rates, guests); the chosen hotel's name/city are what carry through.

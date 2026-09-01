# Carpenter Quotation Backend

FastAPI backend for the kitchen quotation system. Serves everything under
`/api/quotation/...`, matching the frontend's `VITE_API_URL` and the
`{success, data}` / `{success: false, error}` response envelope the React
app already expects.

## Setup

```
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows PowerShell
pip install -r requirements.txt
copy .env.example .env
```

## Run

```
uvicorn app.main:app --reload --port 8000
```

On first startup the SQLite database (`carpenter.db`) is created and seeded
automatically with placeholder categories, brands, products, tier rates,
pricing settings, cities, and services (including the full Kitchen
`configuration_schema`). Seeding is idempotent — it only runs if the
`services` table is empty, so restarting the server never duplicates rows.

To re-seed from scratch, stop the server, delete `carpenter.db`, and start
it again (or run `python -m app.seed.run` directly).

## Key concepts

- **Pricing is entirely server-side.** `POST /quotes/calculate` is stateless
  and safe to call on every keystroke (the frontend debounces it). It never
  writes to the database.
- **`POST /quotes`** recomputes the same calculation and persists it — this
  is the only endpoint that saves a quotation. It also enforces required
  material selections (board/shutter/hardware) that `/calculate` leaves
  optional so live typing never errors.
- **Kitchen quotation modes** (`configuration.quotation_mode` on the Kitchen
  space): `STANDARD` / `PREMIUM` / `ULTRA_PREMIUM` return a flat
  area × tier-rate estimate with no itemized materials. `HANDPICK` uses the
  itemized board/shutter/hardware/screw/glass-cabinet/pantry/rolling-shutter
  pricing engine in `app/pricing/kitchen.py`.
- **Editable business numbers** (tier rates, glass cabinet price, install %,
  tax %, fallback products, etc.) live in the `tier_rates` and
  `pricing_settings` tables — update rows there, no code change or
  migration needed. Seed values are placeholders; see `app/seed/data.py`.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/quotation/categories` | |
| GET | `/api/quotation/brands?category&tier` | |
| GET | `/api/quotation/products?category&brand&tier&spaceType&recommendedFor&priceMin&priceMax` | |
| GET | `/api/quotation/products/compare?ids=1,2,3` | |
| GET | `/api/quotation/cities` | |
| GET | `/api/quotation/services` | |
| GET | `/api/quotation/services/{slug}/configuration` | Kitchen's schema drives the whole wizard |
| POST | `/api/quotation/quotes/calculate` | stateless, matches existing frontend usage |
| POST | `/api/quotation/quotes` | calculates and saves; optional `customer_name/phone/email` |
| GET | `/api/quotation/quotes/{id}` | full stored breakdown |
| GET | `/api/quotation/quotes?limit&offset&customer_phone&customer_email&space_type` | lightweight list |
| POST | `/api/quotation/recommendations` | |

Interactive docs at `http://localhost:8000/docs` once the server is running.

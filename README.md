# デジタル番宣痛車 / site

Next 16 App Router, React 19, TypeScript, Tailwind v4, React Three Fiber. Japanese only.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest: the ¥2,000,000 invariant and progress math
npm run build
```

Copy `.env.example` to `.env.local` for the inquiry API (Supabase + Resend) and `NEXT_PUBLIC_SITE_URL` for OGP absolute URLs. Without env the form still succeeds and the API logs "skipped (no env)". Create the table with `supabase/schema.sql`.

## Where things live

- `PRODUCT.md`, `DESIGN.md`: who it is for, tone, tokens, bans. Read before touching design.
- `src/data/spots.ts`: the 45 spots, single source of truth (prices, names, decal transforms). `src/data/spots.test.ts` guards the sum.
- `src/data/sponsors.ts`: sold spots. Empty at launch. Add a record with a real logo file in `public/logos/` to sell a spot; the tag peels and the logo appears.
- `src/components/car/`: `CarScene` (canvas, studio light, contact shadow, controls), `CarModel` (GLB with node transforms baked, materials), `SpotDecal` (POP札 / logo decal + peel shader), `SpotPanel`, `ProgressOverlay` (the shop counter).
- `src/lib/tagTexture.ts`: draws the POP札 canvas. Same look as `components/ui/PopTag.tsx` in HTML.
- `public/models/car.glb`: Draco GLB, 524 KB. Never run `gltf-transform optimize` on it (see the model appendix in `05 サイト実装ブリーフ.md`).

## Dev-only routes and params (404 in production)

- `/dev/place`: decal placement gizmo. Click a tag, `g` / `r` / `s` to move / rotate / scale, "copy JSON", paste into `spots.ts`. Overrides persist in localStorage.
- `/dev/og`: 1200×630 stage for the OGP image. Regenerate when sponsors change: screenshot `#og` at 2x, save as `public/og.jpg`.
- `/?sell=front-door-r,wiper`: sells spots to a sample sponsor 1.5 s after load, to watch the peel. Add `&peel=0.4` to freeze it mid-way.

## Not in v1

Payments, auth, admin, English, full 特商法 page, real-time progress. See the brief.

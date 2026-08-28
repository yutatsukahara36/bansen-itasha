# デジタル番宣痛車 — DESIGN

Direction locked from step 1.5: **案A 白い売り場**. White gallery page, pearl-white car, all 45 tags at true tier scale, 3/4 front camera, yellow enters through the round shop floor under the car and the paper UI. Yellow sits at the low end of the Committed range (~30%).

## Color (OKLCH, never #fff / #000, every neutral tinted toward the brand hue)

| token | value | use |
|---|---|---|
| `--yellow` | `oklch(92% 0.19 100)` | the one color. POP札, floor disc, buttons, highlights |
| `--yellow-deep` | `oklch(84% 0.18 96)` | pressed / hover yellow |
| `--paper` | `oklch(98.5% 0.012 95)` | page base, panel, counter slip |
| `--paper-2` | `oklch(96% 0.028 97)` | secondary surfaces, empty bar track |
| `--ink` | `oklch(21% 0.012 85)` | text, marker borders, shadows-as-offset |
| `--ink-soft` | `oklch(42% 0.02 85)` | secondary text |
| `--shadow` | `oklch(55% 0.09 95 / 0.28)` | drop shadows, always yellow-tinted |
| `--tape` | `oklch(97% 0.05 98 / 0.75)` | masking tape motif |

No second accent. No gradients as decoration. No glass.

## Type

- Display: `DotGothic16` (Google, OFL). Headlines, prices, counter numbers, buttons.
- Body: `Zen Maru Gothic` 500 / 700 / 900. Everything else.
- Scale (ratio ≥ 1.25): 13 / 16 / 20 / 26 / 34 / 44 / 58 / clamp hero.
- H1 never exceeds 3 lines. Body `max-w-[65ch]`. No meta-labels (no 「SECTION 01」).

## Material: paper and marker

- Surfaces are flat paper with full 3px ink borders and hard offset shadows (`4px 4px 0 ink`). No nested shells, no side-stripe borders, no rounded-card-with-accent.
- POP札: yellow fill, hand-wobbly marker border, DotGothic16 price, small Zen Maru name, masking tape on the top edge, rotated ±3°.
- 非売品 tag: ink fill, yellow text.
- Grain: fixed `pointer-events-none` SVG noise at 4.5% multiply.
- Cursor over the canvas: marker pen.

## Motion

- Ease-out expo `cubic-bezier(0.16, 1, 0.3, 1)` / quart. No bounce, no elastic, no linear, no ease-in-out.
- Animate `transform` and `opacity` only.
- Durations: instant 120ms, state 220ms, panel 600ms, peel 900ms.
- Scroll reveals via `whileInView`. Never a scroll listener.
- Every button: hover lifts 2px, `:active` scale 0.98.
- Car: slow auto-rotate on idle, cancelled on first input, never resumed.

## Components

- `PopTag` (HTML POP札 for price table and counter), `Button` (paper POP button, `primary` yellow / `ghost` paper), `Section` (rhythm `py-24` to `py-40`).
- `ProgressOverlay`: the shop counter slip. Big 「完売まで あと◯枠」, raised / goal, hand-drawn bar, dashed rule, LP remaining. Never a metric card.
- `SpotPanel`: opaque paper, tape in the corner, slides from the right, tier chip, name, yellow price block, note, one CTA.
- Price table on `/sponsor`: differentiated bento with `grid-flow-dense`, S spot large, not 40 equal tiles.

## 3D

- R3F `<Canvas dpr={[1,2]} shadows>`, `powerPreference: high-performance`.
- Studio lighting from a custom `<Environment>` of Lightformers (no external HDR download) + `<ContactShadows>` tinted `--shadow`.
- Car paint: `MeshPhysicalMaterial` white, metalness 0, roughness 0.3, clearcoat 1. Glass transparent 0.42. Body single-sided.
- Spots: parcel map (2026-08-28 pivot, per Yuta). Every paintable triangle is classified into one of the 45 zones (`src/lib/zones.ts` rules + majority smoothing in `src/lib/zoneBuild.ts`). Unsold: tinted parcel (5 alternating yellows, greedy-coloured so neighbours differ) + screen-space ink borders (LineSegments2) + flat name/price label decal. Sold: paper fill + sponsor logo. LP zones: ink fill, 「非売品」 only. Click: zone turns full yellow, the rest dim. The old POP札 decals and the peel are retired.
- Floor: yellow disc under the car, radius 1.75, plus soft AO disc.
- Camera A: position `[1.75, 0.78, 1.95]`, target `[-0.04, 0.10, -0.05]`, fov 30, widened on portrait.

## Layout (hero)

Headline top-left, counter slip bottom-left, CTAs bottom-right, drag hint above the counter. Below 768px: CTAs collapse into the header, counter shrinks, hint hidden.

## Bans (impeccable, adopted)

No `#fff`/`#000`, no side-stripe borders, no gradient text, no glassmorphism, no nested cards, no identical card grids, no hero-metric template, no modal-first, no emojis, no em dashes in copy, no `h-screen`, no arbitrary z-index (tiers: overlay 10, panel 15, header 20, grain 30).

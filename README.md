# paperfolds · house-hunting

A house-hunting companion drawn as a pop-up floor plan. The sheet tilts back and the paper walls
fold up room by room: a 3BHK with three bedrooms (each with its own washroom), a common washroom,
kitchen, hall, dining, and front and back balconies.

> This is the `house-hunting` branch of [paperfolds](../../tree/main). Other folds live on other branches.

## Use it

- **My checklist**: click any room (or *the whole house*) to see its list, split into
  **must-haves** (realistic: walk away without these) and **dream** (would make it feel like ours).
  Add, remove, or move items between the two with ↑ / ↓.
- **+ a house we saw**: every house you visit gets a card: area, price or rent, size, date seen,
  listing link, a gut-feeling star rating and notes. Click rooms and tick what this house has.
- The plan colours itself for the selected house: **green** = every item, **amber** = all
  must-haves but missing some dreams, **red** = a must-have is missing. The card lists what's still
  missing across the whole house.
- **Compare** (with two or more houses) ranks them (must-haves weigh 3× dreams, stars break ties)
  with a room-by-room grid.
- **Flat plan** lays the walls down for a plain top view.

Everything is saved in your browser. **Export** downloads a JSON file you can **import** on
another phone or laptop, or send to family so everyone ticks the same lists.

## Change the house

`src/house.config.ts` holds the rooms, where each sits on the 100 × 72 plan (`box: [x, y, w, h]`),
and the default must / dream items. A different layout (2BHK, a villa) is just different boxes.

## How the walls pop up

Each room is a floor tile (`<button>`) with furniture drawn in SVG and paper walls hinged on its
edges. A top wall is `rotateX(90deg)` about its top edge, a left wall `rotateY(-90deg)` about its
left edge, and so on; flat, they lie on the floor and are hidden. To avoid two walls on every
shared edge, each room only owns its top and left walls, plus bottom/right on the outside of the
house. Balcony walls on the outside become half-height railings. Room labels counter-rotate by
the inverse of the plan's tilt (`rotateZ(18deg) rotateX(-52deg)`) so they stand up facing you.

## Run

```bash
npm install
npm run dev
```

Check out a branch first (`git switch wedding-invite`) to run that fold.

## How it's built

No canvas, no WebGL: everything is SVG drawn with a tiny seeded "pen" (`src/core/sketch.tsx`)
and folded with CSS 3D transforms. Each panel is a `div` hinged on one edge
(`transform-origin`), and a fold is just a rotation about that hinge.

- `src/core/sketch.tsx`: wobbly ink lines (`Ink`), watercolour washes (`Wash`), hatching. Seeded, so a drawing never jitters between renders.
- `src/core/paper.css`: paper stock, grain, ink buttons, fonts (Kalam + Fraunces).
- `src/core/store.ts`: localStorage that never throws.

Stack: Vite, React, TypeScript. Deployed to GitHub Pages by `.github/workflows/pages.yml`,
which builds every branch: `/` is `main`, `/<branch>/` is each fold.

## License

MIT

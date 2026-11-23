# paperfolds

Hand-drawn paper things that fold open in your browser. Every fold lives on its own branch;
`main` is the shelf that links to them all.

| Branch | What it is |
|--------|------------|
| [`wedding-invite`](../../tree/wedding-invite) | A wax-sealed envelope. Break the seal and the letter unfolds into a hand-drawn map of the wedding weekend: tap an event for details, maps and calendar, RSVP into a Google Sheet. Per-guest links, Hindi / English. |
| [`house-hunting`](../../tree/house-hunting) | A 3BHK floor plan whose walls pop up. Every room has a *must-have* and a *dream* checklist; add the houses you visit and see how each scores, room by room. |
| [`family`](../../tree/family) | A five-sided paper lantern, one face per family member. Spin it, then let it unroll into five cards. |

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

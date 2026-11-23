# paperfolds · family

A five-sided paper lantern, one face per family member, lit from inside. Drag it (or use the
arrows) to spin it round; tap the face at the front and the lantern unrolls into a strip of five
cards, with that person's card open below: the three words that are so them, what they light up
about, their superpower, a perfect Sunday, and the thing they always say.

> This is the `family` branch of [paperfolds](../../tree/main). Other folds live on other branches.

## Make it your family

Edit **`src/family.config.ts`**. Each member has a `name`, `role`, three `words`, `loves`,
`superpower`, `sunday`, `says`, a `color` and a `doodle` (`wrench`, `plant`, `laptop`, `music`,
`cricket`, `book`, `coffee`, `camera`; add your own in `src/family/Doodles.tsx`). The five here
are placeholders.

Keys: ← / → spin (or move between cards once unrolled), Esc rolls it back up.

## How the lantern works

It's a regular pentagonal prism made of five `<button>`s. Face *i* is
`rotateY(i·72°) translateZ(a)`, where `a = w / (2·tan 36°)` is the pentagon's apothem, and the top
and bottom caps are pentagons (`clip-path`) with circumradius `w / (2·sin 36°)`, turned 90° and
pushed out by half the height.

Unrolling keeps the same transform list and only changes the numbers: every face goes to
`rotateY(θ) translateZ(0) translateX((i−2)·w)`, where θ is whichever angle ≡ the lantern's spin
(mod 360°) is nearest that face's own angle. That cancels the lantern's rotation with the least
turning, so the faces swing out and lie flat side by side instead of spinning wildly.

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

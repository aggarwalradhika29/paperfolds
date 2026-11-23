# paperfolds · wedding-invite

A wedding invitation that arrives as a wax-sealed envelope with the guest's name on it. Tap the
seal: it cracks, the flap lifts, the letter slides out and unfolds (top third, then bottom third)
into a hand-drawn map of the wedding weekend. Every event is a little building on the map; tap it
for the time, venue, dress code, a Google Maps link and an add-to-calendar file. RSVP from the map,
and replies land in a Google Sheet.

> This is the `wedding-invite` branch of [paperfolds](../../tree/main). Other folds live on other branches.

## Make it yours

Everything is in **`src/invite.config.ts`**:

- `couple`, `initials` (on the wax seal), `city`, `hosts` line, `rsvpBy`
- `events`: name, tagline, start/end, venue, address (for Maps), dress code, colour, which little
  building to draw (`courtyard`, `mandap`, `hall`, `lawn`) and where its pin sits on the 600 × 600 map
- `guests`: one entry per personal link (below)
- `UI`: every piece of interface text, in English and Hindi

Text fields take either a plain string or `{ en, hi }`. The EN / हिं switch is top right and is
remembered per device.

## Personal links

| Link | Envelope says | Sees |
|------|---------------|------|
| `/?g=sharma-family` | "for the Sharma family" | the events listed for that slug, RSVP for up to `seats` people |
| `/?to=Meera%20Aunty` | "for Meera Aunty" | everything, default seats |
| `/` | "for you" | everything |

So the office can get a link that only shows the reception while family sees every function.

## Collect RSVPs in a Google Sheet

Without this, replies only stay on the guest's own phone (fine for trying it out).

1. Make a new Google Sheet. **Extensions → Apps Script**, paste in `apps-script/Code.gs`, save.
2. **Project settings → Script properties**: add `HOST_KEY` with a long random value.
3. **Deploy → New deployment → Web app**. Execute as *me*, access *Anyone*. Copy the URL.
4. Put that URL in `rsvpEndpoint` in `src/invite.config.ts`.

Replies append to an `RSVPs` tab. Open **`/?host=<HOST_KEY>`** for the couple's view: headcount
per event, food totals and every note (latest reply per person wins, so guests can change theirs).

## How the fold works

The letter is one square sheet cut into three horizontal panels. Folded, the top panel is
`rotateX(-180deg)` about its bottom edge and the bottom panel `rotateX(180deg)` about its top edge,
so both lie over the middle one; unfolding just animates them back to 0, top first. The map is
drawn once (`src/invite/MapArt.tsx`) and each panel shows its third of it.

The middle panel never moves. The envelope (back, pocket with a V-notch, flap, seal) is placed
around it as siblings of the letter, so the letter can sit *between* the envelope's back and its
pocket, and "taking the letter out" is the envelope dropping away. The sequence
(seal cracks → flap opens → letter rises → envelope drops → letter unfolds) is a list of stages
in `src/invite/Envelope.tsx`; with reduced motion it jumps straight to the open map.

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

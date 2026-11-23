// main branch: the shelf. Each fold lives on its own branch and is deployed under ./<branch>/.
import { Ink, Wash, rect, circlePts, type Pt } from "./core/sketch";
import "./landing.css";

type Fold = { branch: string; title: string; blurb: string; art: () => JSX.Element; tint: string };

const FOLDS: Fold[] = [
  {
    branch: "wedding-invite",
    title: "the wedding invite",
    blurb: "break the wax seal; the letter unfolds into a map of the wedding weekend. RSVP straight into a Google Sheet.",
    tint: "var(--rose)",
    art: () => (
      <svg viewBox="0 0 120 90" aria-hidden>
        <Wash points={rect(14, 22, 92, 56)} fill="var(--paper-2)" opacity={1} />
        <Ink points={rect(14, 22, 92, 56)} closed seed={11} />
        <Ink points={[[14, 22], [60, 56], [106, 22]] as Pt[]} seed={12} />
        <Wash points={circlePts(60, 56, 9, 10)} fill="var(--wax)" opacity={0.9} seed={4} />
        <Ink points={circlePts(60, 56, 9, 12)} closed seed={13} color="#5c1a1a" />
      </svg>
    ),
  },
  {
    branch: "house-hunting",
    title: "the house hunt",
    blurb: "a 3BHK floor plan whose walls pop up. dream and realistic checklists per room; score every house you visit.",
    tint: "var(--sage)",
    art: () => (
      <svg viewBox="0 0 120 90" aria-hidden>
        <Wash points={[[20, 44], [60, 14], [100, 44], [100, 80], [20, 80]]} fill="var(--sage)" opacity={0.5} />
        <Ink points={[[16, 46], [60, 12], [104, 46]] as Pt[]} seed={21} />
        <Ink points={rect(24, 44, 72, 36)} closed seed={22} />
        <Ink points={rect(52, 58, 16, 22)} closed seed={23} />
        <Ink points={rect(30, 52, 14, 12)} closed seed={24} />
        <Ink points={rect(76, 52, 14, 12)} closed seed={25} />
      </svg>
    ),
  },
  {
    branch: "family",
    title: "the five of us",
    blurb: "a five-sided paper lantern, one face per family member. spin it, then let it unroll into five cards.",
    tint: "var(--marigold)",
    art: () => (
      <svg viewBox="0 0 120 90" aria-hidden>
        <Ink points={[[60, 2], [60, 14]] as Pt[]} seed={31} />
        <Wash points={rect(36, 16, 48, 58)} fill="var(--marigold)" opacity={0.6} />
        <Ink points={rect(36, 16, 48, 58)} closed seed={32} />
        <Ink points={[[50, 16], [50, 74]] as Pt[]} seed={33} />
        <Ink points={[[70, 16], [70, 74]] as Pt[]} seed={34} />
        <Ink points={[[60, 74], [60, 84]] as Pt[]} seed={35} />
      </svg>
    ),
  },
];

export default function App() {
  return (
    <main className="shelf">
      <header>
        <h1 className="hand">paperfolds</h1>
        <p>hand-drawn paper things that fold open in your browser. pick one up.</p>
      </header>
      <ul className="cards">
        {FOLDS.map((f, i) => (
          <li key={f.branch} style={{ ["--tint" as string]: f.tint, ["--tilt" as string]: `${(i - 1) * 1.5}deg` }}>
            <a className="tent" href={`./${f.branch}/`}>
              <div className="flap paper">
                <f.art />
              </div>
              <div className="inside paper">
                <h2 className="hand">{f.title}</h2>
                <p>{f.blurb}</p>
                <code>branch: {f.branch}</code>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <footer className="hand">
        made with paper, ink and a bit of trigonometry ·{" "}
        <a href="https://github.com/aggarwalradhika29/paperfolds">source</a>
      </footer>
    </main>
  );
}

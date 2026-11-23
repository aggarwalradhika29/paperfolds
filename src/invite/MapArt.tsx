// The inside of the letter: a hand-drawn map of the wedding weekend, 600 × 600.
// Pure drawing (no interaction): the letter renders it once per fold panel.
import { memo } from "react";
import { Ink, Wash, Hatch, rect, circlePts, hash, rng, type Pt } from "../core/sketch";
import { INVITE, type InviteEvent, type Venue } from "../invite.config";
import { fmtRange, tr, type Lang } from "./lib";

const off = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);
const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 22): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });

function Tree({ x, y, s = 1, seed }: { x: number; y: number; s?: number; seed: number }) {
  return (
    <g>
      <Wash points={circlePts(x, y - 14 * s, 11 * s, 9)} fill="var(--sage)" seed={seed} opacity={0.7} />
      <Ink points={circlePts(x, y - 14 * s, 11 * s, 9)} closed seed={seed} width={1.2} amp={1.4} />
      <Ink points={[[x, y - 4 * s], [x, y + 4 * s]]} seed={seed + 1} width={1.3} />
    </g>
  );
}

/** Little buildings, drawn around (0,0) = middle of their base. */
function Building({ kind, color, seed }: { kind: Venue; color: string; seed: number }) {
  switch (kind) {
    case "courtyard":
      return (
        <g>
          <Wash points={rect(-40, -36, 80, 36)} fill={color} seed={seed} />
          <Ink points={rect(-40, -36, 80, 36)} closed seed={seed} />
          {[-24, 0, 24].map((x, i) => (
            <Ink key={i} points={[[x - 8, 0], [x - 8, -16], [x - 5, -22], [x, -25], [x + 5, -22], [x + 8, -16], [x + 8, 0]]} seed={seed + 3 + i} width={1.2} />
          ))}
          {[-30, 30].map((x, i) => (
            <Ink key={i} points={[[x - 7, -36], [x - 7, -42], [x - 3, -48], [x, -50], [x + 3, -48], [x + 7, -42], [x + 7, -36]]} seed={seed + 9 + i} width={1.2} />
          ))}
        </g>
      );
    case "mandap":
      return (
        <g>
          <Wash points={[[-40, -40], [0, -56], [40, -40]]} fill={color} seed={seed} opacity={0.8} />
          <Ink points={[[-42, -40], [-20, -50], [0, -57], [20, -50], [42, -40], [-42, -40]]} seed={seed} />
          {[-36, -12, 12, 36].map((x, i) => (
            <Ink key={i} points={[[x, -40], [x, 0]]} seed={seed + 2 + i} width={1.3} />
          ))}
          <Ink points={[[-36, -34], [-24, -28], [-12, -34], [0, -28], [12, -34], [24, -28], [36, -34]]} seed={seed + 8} color="var(--marigold)" width={2} double={false} />
          <Wash points={[[-6, 0], [0, -14], [6, 0]]} fill="var(--marigold)" seed={seed + 9} opacity={0.9} />
          <Ink points={[[-6, 0], [-2, -8], [0, -14], [3, -7], [6, 0]]} seed={seed + 10} width={1} />
          <Ink points={[[-46, 0], [46, 0]]} seed={seed + 11} />
        </g>
      );
    case "hall":
      return (
        <g>
          <Wash points={rect(-44, -34, 88, 34)} fill={color} seed={seed} />
          <Ink points={rect(-44, -34, 88, 34)} closed seed={seed} />
          <Ink points={[[-16, -34], [-14, -46], [-6, -54], [0, -60], [6, -54], [14, -46], [16, -34]]} seed={seed + 1} />
          <Ink points={[[0, -60], [0, -66]]} seed={seed + 2} width={1} />
          {[-40, 40].map((x, i) => (
            <Ink key={i} points={[[x - 4, -34], [x - 4, -52], [x, -57], [x + 4, -52], [x + 4, -34]]} seed={seed + 3 + i} width={1.2} />
          ))}
          {[-28, -14, 0, 14, 28].map((x, i) => (
            <Ink key={i} points={rect(x - 4, -24, 8, 12)} closed seed={seed + 6 + i} width={1} double={false} />
          ))}
          <Hatch x={-44} y={-8} w={88} h={8} gap={5} seed={seed + 20} opacity={0.25} />
        </g>
      );
    case "lawn":
      return (
        <g>
          <Wash points={rect(-34, -8, 68, 10)} fill={color} seed={seed} opacity={0.5} />
          <Ink points={rect(-34, -8, 68, 10)} closed seed={seed} width={1.2} />
          {[-24, -8, 8, 24].map((x, i) => (
            <Ink key={i} points={[[x, -8], [x, 2]]} seed={seed + 1 + i} width={0.8} double={false} />
          ))}
          <Tree x={-44} y={0} s={1.3} seed={seed + 6} />
          <Tree x={44} y={0} s={1.3} seed={seed + 7} />
          <Ink points={[[-44, -28], [-22, -16], [0, -24], [22, -16], [44, -28]]} seed={seed + 8} width={1} />
          {[-33, -11, 11, 33].map((x, i) => (
            <circle key={i} cx={x} cy={i % 2 ? -18 : -20} r={2.6} fill="var(--marigold)" stroke="var(--ink)" strokeWidth={0.6} />
          ))}
        </g>
      );
  }
}

/** How tall each building is, so its pin can sit just above the roof. */
export const ROOF: Record<Venue, number> = { courtyard: 50, mandap: 57, hall: 66, lawn: 32 };

function Pin({ e, lang }: { e: InviteEvent; lang: Lang }) {
  const seed = hash(e.key);
  const [x, y] = e.at;
  const day = new Date(e.start).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" });
  return (
    <g transform={`translate(${x} ${y})`}>
      <Building kind={e.drawing} color={e.color} seed={seed} />
      <g transform={`translate(0 ${-ROOF[e.drawing] - 22})`}>
        <Wash points={[[0, 16], [-9, 0], [-9, -6], [-4, -12], [4, -12], [9, -6], [9, 0]]} fill={e.color} seed={seed + 40} opacity={0.95} />
        <Ink points={[[0, 16], [-9, 0], [-9, -7], [-5, -12], [0, -14], [5, -12], [9, -7], [9, 0], [0, 16]]} seed={seed + 41} width={1.4} />
        <circle cx={0} cy={-4} r={3} fill="var(--paper)" stroke="var(--ink)" strokeWidth={0.8} />
      </g>
      <text y={22} textAnchor="middle" className="map-label">
        {tr(e.name, lang)}
      </text>
      <text y={38} textAnchor="middle" className="map-sub">
        {day}
      </text>
    </g>
  );
}

function MapArtInner({ events, lang }: { events: InviteEvent[]; lang: Lang }) {
  const r = rng(77);
  const trees: [number, number][] = [
    [40, 180], [64, 196], [250, 190], [280, 210], [560, 300], [540, 330], [380, 270], [60, 500], [90, 520], [300, 540], [330, 520], [560, 420], [210, 250],
  ];
  // The journey through the weekend, in date order.
  const route = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const path: Pt[] = route.map((e) => [e.at[0], e.at[1] + 30]);
  const [a, b] = INVITE.couple;

  return (
    <svg viewBox="0 0 600 600" className="map-art" aria-hidden>
      {/* hills along the top */}
      <Wash points={[[0, 150], [60, 120], [130, 140], [210, 112], [300, 138], [380, 116], [470, 140], [540, 118], [600, 136], [600, 160], [0, 160]]} fill="var(--sage)" seed={2} opacity={0.3} />
      <Ink points={[[0, 150], [60, 120], [130, 140], [210, 112], [300, 138], [380, 116], [470, 140], [540, 118], [600, 136]]} seed={3} width={1.1} />

      {/* title cartouche */}
      <text x={300} y={52} textAnchor="middle" className="map-title">
        {a} &amp; {b}
      </text>
      <text x={300} y={78} textAnchor="middle" className="map-hosts">
        {tr(INVITE.hosts, lang)}
      </text>
      <text x={300} y={100} textAnchor="middle" className="map-sub">
        {tr(INVITE.city, lang)} · {fmtRange(route, lang)}
      </text>
      <Ink points={[[190, 64], [240, 60], [300, 63], [360, 60], [410, 64]]} seed={5} width={1} color="var(--rose)" double={false} />

      {/* the lake */}
      <Wash points={ellipse(175, 395, 108, 74)} fill="var(--sky)" seed={8} opacity={0.55} amp={6} />
      <Ink points={ellipse(175, 395, 108, 74)} closed seed={9} amp={3} />
      {[[120, 380], [200, 420], [150, 440], [230, 370]].map(([x, y], i) => (
        <Ink key={i} points={[[x, y], [x + 8, y - 3], [x + 16, y]]} seed={20 + i} width={0.9} double={false} color="var(--ink-soft)" />
      ))}
      {/* a boat */}
      <g transform="translate(110 405)">
        <Ink points={[[-14, 0], [-9, 6], [9, 6], [14, 0], [-14, 0]]} seed={30} width={1.2} />
        <Ink points={[[0, 0], [0, -16], [9, -2], [0, -2]]} seed={31} width={1} />
      </g>
      <text x={175} y={470} textAnchor="middle" className="map-sub" opacity={0.7}>
        ~ {lang === "hi" ? "झील" : "the lake"} ~
      </text>

      {/* dotted path through the weekend */}
      {path.length > 1 &&
        path.slice(1).map((p, i) => {
          const q = path[i];
          const mid: Pt = [(q[0] + p[0]) / 2 + (r() - 0.5) * 60, (q[1] + p[1]) / 2 + (r() - 0.5) * 40];
          return (
            <path
              key={i}
              d={`M${q[0]} ${q[1]}Q${mid[0]} ${mid[1]} ${p[0]} ${p[1]}`}
              fill="none"
              stroke="var(--ink-soft)"
              strokeWidth={1.4}
              strokeDasharray="2 6"
              strokeLinecap="round"
            />
          );
        })}

      {trees.map(([x, y], i) => (
        <Tree key={i} x={x} y={y} seed={100 + i} s={0.8 + (i % 3) * 0.15} />
      ))}

      {/* sun and birds */}
      <Wash points={circlePts(548, 60, 18, 10)} fill="var(--marigold)" seed={40} opacity={0.7} />
      <Ink points={circlePts(548, 60, 18, 12)} closed seed={41} width={1.2} />
      {[[470, 60], [490, 48]].map(([x, y], i) => (
        <Ink key={i} points={[[x - 7, y], [x - 3, y - 4], [x, y], [x + 3, y - 4], [x + 7, y]]} seed={50 + i} width={1} double={false} />
      ))}

      {/* compass */}
      <g transform="translate(56 568)">
        <Ink points={off([[0, -18], [5, 0], [0, 18], [-5, 0], [0, -18]], 0, 0)} seed={60} width={1.1} />
        <Ink points={[[-18, 0], [18, 0]]} seed={61} width={0.8} double={false} />
        <text y={-22} textAnchor="middle" className="map-sub" style={{ fontSize: 11 }}>
          N
        </text>
      </g>

      {events.map((e) => (
        <Pin key={e.key} e={e} lang={lang} />
      ))}
    </svg>
  );
}

export const MapArt = memo(MapArtInner);

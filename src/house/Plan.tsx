// The pop-up floor plan. Every room is a floor tile with furniture drawn on it and paper
// walls hinged on its edges: flat, the walls lie on the floor; popped up, each rotates 90°
// about the edge it's glued to. Shared walls are drawn once (top and left edges of every
// room, plus bottom/right only on the outside of the house), so nothing doubles up.
import { memo } from "react";
import { Ink, Wash, Hatch, rect, circlePts, hash, type Pt } from "../core/sketch";
import { PLAN, PASSAGES, ROOMS, KIND_COLOR, type RoomDef, type RoomKind } from "../house.config";
import { score, roomState, type Hunt, type Listing } from "./state";

const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 16): Pt[] =>
  Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * rx, cy + Math.sin((i / n) * Math.PI * 2) * ry]);

/** Furniture doodles in room-local units (room w × h, times 10). */
const Furniture = memo(function Furniture({ kind, W, H, seed, outer }: { kind: RoomKind; W: number; H: number; seed: number; outer: { top: boolean; bottom: boolean } }) {
  const ink = (pts: Pt[], s: number, closed = true, width = 1.4) => <Ink points={pts} closed={closed} seed={seed + s} width={width} amp={1} />;
  switch (kind) {
    case "bed": {
      const bw = Math.min(W * 0.55, 150);
      const bh = Math.min(H * 0.55, 190);
      const x = (W - bw) / 2;
      return (
        <g>
          <Wash points={rect(x, 12, bw, bh)} fill="#fff8ee" opacity={0.9} seed={seed} />
          {ink(rect(x, 12, bw, bh), 1)}
          {ink(rect(x + 8, 20, bw / 2 - 12, 26), 2, true, 1)}
          {ink(rect(x + bw / 2 + 4, 20, bw / 2 - 12, 26), 3, true, 1)}
          {ink([[x, 12 + bh * 0.38], [x + bw, 12 + bh * 0.38]], 4, false, 1)}
          {ink(rect(8, H * 0.42, 22, H * 0.45), 5, true, 1.2)}
          {ink([[19, H * 0.42], [19, H * 0.87]], 6, false, 0.8)}
        </g>
      );
    }
    case "bath":
      return (
        <g>
          {ink(rect(W * 0.18, 10, W * 0.3, 14), 1, true, 1.1)}
          {ink(ellipse(W * 0.33, 40, W * 0.12, 16), 2, true, 1.1)}
          {ink(rect(W * 0.55, 10, W * 0.32, 22), 3, true, 1.1)}
          {ink(ellipse(W * 0.71, 21, 7, 5), 4, true, 0.9)}
          <Hatch x={W * 0.12} y={H * 0.55} w={W * 0.76} h={H * 0.38} gap={7} seed={seed + 9} opacity={0.25} />
        </g>
      );
    case "kitchen":
      return (
        <g>
          <Wash points={rect(6, 6, W - 12, 34)} fill="#fff8ee" opacity={0.8} seed={seed} />
          {ink([[6, 40], [W - 6, 40]], 1, false)}
          {ink([[40, 40], [40, H * 0.85], [6, H * 0.85]], 2, false)}
          {ink(circlePts(W * 0.45, 22, 8, 10), 3, true, 1)}
          {ink(circlePts(W * 0.6, 22, 8, 10), 4, true, 1)}
          {ink(rect(W * 0.74, 12, 34, 22), 5, true, 1)}
          {ink(rect(W - 40, H * 0.55, 32, 40), 6, true, 1.1)}
        </g>
      );
    case "living":
      return (
        <g>
          <Wash points={ellipse(W * 0.5, H * 0.52, W * 0.28, H * 0.22)} fill="var(--rose)" opacity={0.25} seed={seed} />
          {ink([[W * 0.25, 8], [W * 0.75, 8]], 1, false, 2.4)}
          {ink(rect(W * 0.38, H * 0.44, W * 0.24, H * 0.14), 2, true, 1.1)}
          {ink(rect(W * 0.22, H * 0.72, W * 0.56, H * 0.17), 3)}
          {ink([[W * 0.22, H * 0.8], [W * 0.78, H * 0.8]], 4, false, 1)}
          {ink(circlePts(30, H * 0.3, 14, 9), 5, true, 1)}
        </g>
      );
    case "dining": {
      const tw = W * 0.5;
      const th = H * 0.36;
      const x = (W - tw) / 2;
      const y = (H - th) / 2;
      const chairs: Pt[] = [
        [x + tw * 0.2, y - 16], [x + tw * 0.55, y - 16], [x + tw * 0.2, y + th + 4], [x + tw * 0.55, y + th + 4], [x - 16, y + th / 2 - 6], [x + tw + 4, y + th / 2 - 6],
      ];
      return (
        <g>
          <Wash points={rect(x, y, tw, th)} fill="#c79a6b" opacity={0.45} seed={seed} />
          {ink(rect(x, y, tw, th), 1)}
          {chairs.map(([cx, cy], i) => (
            <g key={i}>{ink(rect(cx, cy, 12, 12), 10 + i, true, 1)}</g>
          ))}
        </g>
      );
    }
    case "balcony": {
      const pots = Math.max(2, Math.floor(W / 120));
      return (
        <g>
          {outer.bottom && <Hatch x={0} y={H - 10} w={W} h={10} gap={6} seed={seed + 3} opacity={0.4} />}
          {outer.top && <Hatch x={0} y={0} w={W} h={10} gap={6} seed={seed + 4} opacity={0.4} />}
          {Array.from({ length: pots }, (_, i) => {
            const cx = ((i + 0.5) / pots) * W;
            return (
              <g key={i}>
                <Wash points={circlePts(cx, H / 2, 12, 9)} fill="var(--sage)" opacity={0.8} seed={seed + 20 + i} />
                {ink(circlePts(cx, H / 2, 12, 9), 30 + i, true, 1)}
              </g>
            );
          })}
        </g>
      );
    }
    default:
      return null;
  }
});

const pos = (b: [number, number, number, number]) => ({
  left: `${(b[0] / PLAN.w) * 100}%`,
  top: `${(b[1] / PLAN.h) * 100}%`,
  width: `${(b[2] / PLAN.w) * 100}%`,
  height: `${(b[3] / PLAN.h) * 100}%`,
});

type Props = {
  hunt: Hunt;
  listing: Listing | null;
  selected: string | null;
  onSelect: (id: string) => void;
  popped: boolean;
  tilted: boolean;
};

export function Plan({ hunt, listing, selected, onSelect, popped, tilted }: Props) {
  const rooms = ROOMS.filter((r): r is RoomDef & { box: [number, number, number, number] } => !!r.box);
  return (
    <div className={`plan-stage ${tilted ? "tilted" : ""} ${popped ? "popped" : ""}`}>
      <div className="plan paper" role="group" aria-label="floor plan">
        {PASSAGES.map((p) => (
          <div key={p.label} className="room passage" style={pos(p.box)}>
            <span className="room-label">{p.label}</span>
            <Walls box={p.box} order={0} />
          </div>
        ))}
        {rooms.map((r, i) => {
          const [, y, w, h] = r.box;
          const outer = { top: y === 0, bottom: y + h === PLAN.h };
          const items = hunt.items[r.id] ?? [];
          const state = listing ? roomState(items, listing) : null;
          const s = listing ? score(items, listing) : null;
          return (
            <button
              key={r.id}
              className={`room ${r.kind} ${selected === r.id ? "sel" : ""} ${state ? `st-${state}` : ""}`}
              style={{ ...pos(r.box), ["--floor" as string]: KIND_COLOR[r.kind] }}
              onClick={() => onSelect(r.id)}
              aria-pressed={selected === r.id}
            >
              <svg className="furniture" viewBox={`0 0 ${w * 10} ${h * 10}`} preserveAspectRatio="none" aria-hidden>
                <Furniture kind={r.kind} W={w * 10} H={h * 10} seed={hash(r.id)} outer={outer} />
              </svg>
              <span className="room-label">
                {r.name}
                {s && (
                  <small>
                    {s.must}/{s.mustOf}
                    {s.dreamOf > 0 && <i> · ✦{s.dream}</i>}
                  </small>
                )}
              </span>
              <Walls box={r.box} order={i} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Walls({ box, order }: { box: [number, number, number, number]; order: number }) {
  const [x, y, w, h] = box;
  // [side, is it on the outside of the house?]
  const sides: [string, boolean][] = [
    ["top", y === 0],
    ["left", x === 0],
  ];
  if (x + w === PLAN.w) sides.push(["right", true]);
  if (y + h === PLAN.h) sides.push(["bottom", true]);
  return (
    <>
      {sides.map(([s, outer]) => (
        <span key={s} className={`wall ${s} ${outer ? "outer" : ""}`} style={{ transitionDelay: `${0.25 + order * 0.06}s` }} aria-hidden />
      ))}
    </>
  );
}

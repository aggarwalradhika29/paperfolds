// Tiny hand-drawn SVG kit: wobbly ink lines and watercolour washes, all seeded so a
// drawing looks the same on every render (no flicker when React re-renders).
import type { SVGProps } from "react";

export type Pt = [number, number];

/** Deterministic PRNG (xorshift32). */
export function rng(seed: number) {
  let s = seed >>> 0 || 0x9e3779b9;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** Stable numeric hash of a string, for seeding drawings from names/ids. */
export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const rect = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

export function circlePts(cx: number, cy: number, r: number, n = 18): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });
}

/** A path through the points where every segment bows and overshoots a little, like a pen stroke. */
export function wobble(points: Pt[], seed: number, amp = 1.2, closed = false) {
  const r = rng(seed);
  const pts = closed ? [...points, points[0]] : points;
  const j = () => (r() - 0.5) * 2 * amp;
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const sx = x1 + j();
    const sy = y1 + j();
    const ex = x2 + j();
    const ey = y2 + j();
    const mx = (sx + ex) / 2 + j() * 1.4;
    const my = (sy + ey) / 2 + j() * 1.4;
    d += `M${sx.toFixed(1)} ${sy.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }
  return d;
}

/** A smooth closed blob through jittered points (for washes and organic shapes). */
export function blob(points: Pt[], seed: number, amp = 1.5) {
  const r = rng(seed);
  const p = points.map(([x, y]) => [x + (r() - 0.5) * 2 * amp, y + (r() - 0.5) * 2 * amp] as Pt);
  const n = p.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const b = p[(i + 1) % n];
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (i === 0) {
      const z = p[n - 1];
      d += `M${((z[0] + a[0]) / 2).toFixed(1)} ${((z[1] + a[1]) / 2).toFixed(1)}`;
    }
    d += `Q${a[0].toFixed(1)} ${a[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + "Z";
}

type InkProps = {
  points: Pt[];
  seed?: number;
  closed?: boolean;
  amp?: number;
  /** Draw a second, fainter pass so lines look gone-over by hand. */
  double?: boolean;
  width?: number;
  color?: string;
} & Omit<SVGProps<SVGGElement>, "color" | "points">;

export function Ink({ points, seed = 1, closed = false, amp = 1.2, double = true, width = 1.6, color = "var(--ink)", ...rest }: InkProps) {
  return (
    <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d={wobble(points, seed, amp, closed)} strokeWidth={width} />
      {double && <path d={wobble(points, seed + 101, amp * 1.3, closed)} strokeWidth={width * 0.6} opacity={0.45} />}
    </g>
  );
}

type WashProps = { points: Pt[]; fill: string; seed?: number; amp?: number; opacity?: number } & Omit<SVGProps<SVGPathElement>, "points" | "fill">;

/** Watercolour fill: a soft blob, slightly off the ink line, with a darker pooled edge. */
export function Wash({ points, fill, seed = 3, amp = 2, opacity = 0.55, ...rest }: WashProps) {
  return (
    <g opacity={opacity}>
      <path d={blob(points, seed, amp)} fill={fill} {...rest} />
      <path d={blob(points, seed + 9, amp * 0.7)} fill="none" stroke={fill} strokeWidth={2.2} opacity={0.6} />
    </g>
  );
}

/** Diagonal pen hatching clipped to a rectangle. */
export function Hatch({ x, y, w, h, gap = 6, seed = 5, color = "var(--ink)", opacity = 0.35 }: { x: number; y: number; w: number; h: number; gap?: number; seed?: number; color?: string; opacity?: number }) {
  const lines: Pt[][] = [];
  for (let k = -h; k < w; k += gap) {
    const x1 = Math.max(x, x + k);
    const y1 = y + (x1 - (x + k));
    const x2 = Math.min(x + w, x + k + h);
    const y2 = y + (x2 - (x + k));
    lines.push([
      [x1, y1],
      [x2, y2],
    ]);
  }
  return (
    <g opacity={opacity}>
      {lines.map((l, i) => (
        <Ink key={i} points={l} seed={seed + i} amp={0.6} double={false} width={0.8} color={color} />
      ))}
    </g>
  );
}

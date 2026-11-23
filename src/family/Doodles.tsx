// One little ink doodle per person, in a 100 × 100 box.
import { memo } from "react";
import { Ink, Wash, rect, circlePts, type Pt } from "../core/sketch";
import type { Doodle as Kind } from "../family.config";

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 10): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

function DoodleInner({ kind, color }: { kind: Kind; color: string }) {
  const w = 2.2;
  let body: JSX.Element;
  switch (kind) {
    case "wrench":
      body = (
        <>
          <Wash points={[[30, 76], [66, 40], [74, 48], [38, 84]]} fill={color} />
          <Ink points={[[30, 76], [66, 40]]} width={w} seed={1} />
          <Ink points={[[38, 84], [74, 48]]} width={w} seed={2} />
          <Ink points={arc(72, 32, 14, 2.2, 6.6)} width={w} seed={3} />
          <Ink points={[[30, 76], [26, 82], [32, 88], [38, 84]]} width={w} seed={4} />
        </>
      );
      break;
    case "plant":
      body = (
        <>
          <Wash points={[[32, 62], [68, 62], [62, 88], [38, 88]]} fill="#c98a5e" />
          <Ink points={[[30, 62], [70, 62], [62, 88], [38, 88]]} closed width={w} seed={1} />
          <Ink points={[[50, 62], [50, 30]]} width={w} seed={2} />
          <Wash points={[[50, 44], [30, 34], [24, 20], [40, 24]]} fill={color} />
          <Ink points={[[50, 44], [30, 34], [24, 20], [40, 24], [50, 44]]} width={1.8} seed={3} />
          <Wash points={[[50, 38], [70, 26], [78, 12], [60, 18]]} fill={color} />
          <Ink points={[[50, 38], [70, 26], [78, 12], [60, 18], [50, 38]]} width={1.8} seed={4} />
        </>
      );
      break;
    case "laptop":
      body = (
        <>
          <Wash points={rect(26, 26, 48, 34)} fill={color} />
          <Ink points={rect(26, 26, 48, 34)} closed width={w} seed={1} />
          <Ink points={[[18, 70], [82, 70], [74, 60], [26, 60], [18, 70]]} width={w} seed={2} />
          <Ink points={[[36, 38], [42, 43], [36, 48]]} width={1.6} seed={3} />
          <Ink points={[[46, 48], [56, 48]]} width={1.6} seed={4} />
        </>
      );
      break;
    case "music":
      body = (
        <>
          <Ink points={arc(50, 54, 28, Math.PI, Math.PI * 2)} width={w} seed={1} />
          <Wash points={rect(16, 52, 14, 24)} fill={color} />
          <Ink points={rect(16, 52, 14, 24)} closed width={w} seed={2} />
          <Wash points={rect(70, 52, 14, 24)} fill={color} />
          <Ink points={rect(70, 52, 14, 24)} closed width={w} seed={3} />
          <Ink points={[[44, 40], [44, 20], [58, 16], [58, 36]]} width={1.6} seed={4} />
          <Ink points={circlePts(41, 41, 4, 8)} closed width={1.4} seed={5} />
          <Ink points={circlePts(55, 37, 4, 8)} closed width={1.4} seed={6} />
        </>
      );
      break;
    case "cricket":
      body = (
        <>
          <Wash points={[[36, 16], [48, 12], [62, 66], [52, 70]]} fill="#e3c08a" />
          <Ink points={[[36, 16], [48, 12], [62, 66], [52, 70], [36, 16]]} width={w} seed={1} />
          <Ink points={[[57, 68], [62, 86]]} width={3} seed={2} />
          <Wash points={circlePts(74, 30, 9, 10)} fill={color} opacity={0.9} />
          <Ink points={circlePts(74, 30, 9, 12)} closed width={1.8} seed={3} />
          <Ink points={arc(74, 30, 9, -1.2, 1.2, 5)} width={1} seed={4} double={false} />
        </>
      );
      break;
    case "book":
      body = (
        <>
          <Wash points={[[18, 30], [50, 36], [82, 30], [82, 74], [50, 80], [18, 74]]} fill={color} />
          <Ink points={[[18, 30], [50, 36], [82, 30], [82, 74], [50, 80], [18, 74], [18, 30]]} width={w} seed={1} />
          <Ink points={[[50, 36], [50, 80]]} width={1.6} seed={2} />
        </>
      );
      break;
    case "coffee":
      body = (
        <>
          <Wash points={[[28, 40], [68, 40], [64, 80], [32, 80]]} fill={color} />
          <Ink points={[[28, 40], [68, 40], [64, 80], [32, 80], [28, 40]]} width={w} seed={1} />
          <Ink points={arc(70, 56, 9, -1.4, 1.4)} width={w} seed={2} />
          <Ink points={[[40, 32], [44, 24], [40, 16]]} width={1.4} seed={3} />
          <Ink points={[[54, 32], [58, 24], [54, 16]]} width={1.4} seed={4} />
        </>
      );
      break;
    case "camera":
      body = (
        <>
          <Wash points={rect(18, 34, 64, 42)} fill={color} />
          <Ink points={rect(18, 34, 64, 42)} closed width={w} seed={1} />
          <Ink points={[[36, 34], [40, 26], [58, 26], [62, 34]]} width={w} seed={2} />
          <Ink points={circlePts(50, 55, 12, 12)} closed width={w} seed={3} />
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="doodle">
      {body}
    </svg>
  );
}

export const Doodle = memo(DoodleInner);

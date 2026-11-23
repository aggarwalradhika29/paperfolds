// The envelope and the tri-fold letter inside it.
//
// The letter is a square sheet folded in thirds (top and bottom panels folded over the middle).
// Its middle panel never moves: the envelope is placed around it, so "taking the letter out"
// is just the envelope dropping away. Each fold is a rotation about the panel's shared edge.
import { useContext, useEffect, useRef, useState } from "react";
import { Ink, Wash, rect, circlePts, type Pt } from "../core/sketch";
import { INVITE, UI, type InviteEvent } from "../invite.config";
import { MapArt, ROOF } from "./MapArt";
import { LangContext, useT, fmtRange } from "./lib";

const STAGES = ["sealed", "crack", "flap", "rise", "out", "unfold", "open"] as const;
export type Stage = (typeof STAGES)[number];
// How long each stage plays before the next one starts (ms).
const DURATION: Partial<Record<Stage, number>> = { crack: 500, flap: 700, rise: 850, out: 750, unfold: 1500 };

export function useEnvelope() {
  const [stage, setStage] = useState<Stage>("sealed");
  const timers = useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function play(seq: Stage[], durations = DURATION) {
    clear();
    let t = 0;
    for (const s of seq) {
      timers.current.push(window.setTimeout(() => setStage(s), t));
      t += durations[s] ?? 0;
    }
  }
  const open = () => (reduced() ? setStage("open") : play(["crack", "flap", "rise", "out", "unfold", "open"]));
  // Folding back up: panels fold (out), envelope comes back up under the letter (rise), letter tucks in.
  const close = () => (reduced() ? setStage("sealed") : play(["out", "rise", "sealed"], { out: 1400, rise: 900 }));
  const at = (s: Stage) => STAGES.indexOf(stage) >= STAGES.indexOf(s);
  return { stage, open, close, at };
}

function Seal({ initials }: { initials: string }) {
  const blobPts = circlePts(50, 50, 40, 14);
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <Wash points={blobPts} fill="var(--wax)" opacity={1} amp={5} seed={7} />
      <Wash points={circlePts(50, 50, 30, 12)} fill="#7a1f1f" opacity={0.6} amp={2} seed={8} />
      <Ink points={circlePts(50, 50, 30, 16)} closed seed={9} color="#4a1010" width={1.4} />
      <text x={50} y={57} textAnchor="middle" className="seal-text">
        {initials}
      </text>
    </svg>
  );
}

function Stamp() {
  return (
    <svg viewBox="0 0 60 70" className="stamp" aria-hidden>
      <rect x={3} y={3} width={54} height={64} fill="var(--paper)" stroke="var(--ink-soft)" strokeDasharray="3 3" />
      <Wash points={rect(10, 10, 40, 50)} fill="var(--rose)" opacity={0.45} />
      <Ink points={[[16, 48], [24, 30], [30, 38], [38, 22], [46, 48]] as Pt[]} seed={3} width={1.2} />
      <Ink points={circlePts(40, 20, 4, 8)} closed seed={4} width={1} />
    </svg>
  );
}

type Props = {
  env: ReturnType<typeof useEnvelope>;
  guestName: string;
  events: InviteEvent[];
  onPin: (e: InviteEvent) => void;
};

export function Envelope({ env, guestName, events, onPin }: Props) {
  const lang = useContext(LangContext);
  const t = useT();
  const { at } = env;
  const [a, b] = INVITE.couple;
  const cls = ["scene", at("crack") && "cracked", at("flap") && "flap-open", at("rise") && "risen", at("out") && "out", at("unfold") && "unfolded", at("open") && "is-open"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <div className="letter">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`panel p${i}`}>
            <div className="face front paper">
              <div className="slice" style={{ top: `${-i * 100}%` }}>
                <MapArt events={events} lang={lang} />
              </div>
            </div>
            <div className="face back paper">
              {i === 0 && (
                <div className="cover-names">
                  <span className="hand">
                    {a} &amp; {b}
                  </span>
                  <small>{fmtRange(events, lang)}</small>
                </div>
              )}
            </div>
          </div>
        ))}
        {at("open") &&
          events.map((e) => (
            <button
              key={e.key}
              className="pin-hit"
              style={{ left: `${(e.at[0] / 600) * 100}%`, top: `${((e.at[1] - ROOF[e.drawing] / 2 - 8) / 600) * 100}%` }}
              onClick={() => onPin(e)}
            >
              <span className="sr-only">{t(e.name)}</span>
            </button>
          ))}
      </div>

      {/* Envelope pieces are siblings of the letter so it can sit between back and pocket. */}
      <div className="env env-back" aria-hidden />
      <div className="env env-pocket" aria-hidden={at("out")}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pocket-lines" aria-hidden>
          <path d="M0 100 L50 56 L100 100" />
          <path d="M0 0 L50 52 L100 0" />
        </svg>
        <div className="addressee hand">
          <small>{t(UI.for)}</small> {guestName}
        </div>
        <Stamp />
      </div>
      <div className="env env-flap" aria-hidden>
        <div className="flap-face" />
        <div className="flap-liner" />
      </div>
      <button className="seal" onClick={env.open} disabled={at("crack")} aria-label={t(UI.tapSeal)}>
        <span className="half l">
          <Seal initials={INVITE.initials} />
        </span>
        <span className="half r">
          <Seal initials={INVITE.initials} />
        </span>
      </button>
    </div>
  );
}

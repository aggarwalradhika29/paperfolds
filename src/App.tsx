// family: a five-sided paper lantern, one face per person. Spin it; tap the front face and it
// unrolls into a strip of five cards.
//
// Geometry: a regular pentagonal prism. Face i sits at rotateY(i·72°) translateZ(a), where
// a = w / (2·tan 36°) is the apothem. Unrolled, every face goes to translateX((i−2)·w) with its
// rotation cancelling the lantern's spin, so the same transform list just interpolates from
// "wrapped round" to "laid flat".
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FAMILY, type Member } from "./family.config";
import { Doodle } from "./family/Doodles";
import "./family/family.css";

const N = 5;
const STEP = 360 / N;
const mod = (n: number, m: number) => ((n % m) + m) % m;
// Pentagon for the top/bottom caps, oriented so its edges line up with the faces.
const PENTAGON = Array.from({ length: N }, (_, k) => {
  const phi = ((54 - 72 * k) * Math.PI) / 180;
  return `${50 + 50 * Math.cos(phi)}% ${50 + 50 * Math.sin(phi)}%`;
}).join(", ");

export default function App() {
  const members = FAMILY.members.slice(0, N);
  const [spin, setSpin] = useState(-360);
  const [flat, setFlat] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; spin: number; moved: boolean } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const front = mod(Math.round(spin / STEP), N);

  useEffect(() => {
    document.title = FAMILY.title;
    const t = setTimeout(() => setSpin(0), 120); // drop in with a twirl
    return () => clearTimeout(t);
  }, []);

  // Rotate the shortest way so face i comes to the front.
  const turnTo = (i: number) => setSpin((s) => s + (((i - mod(Math.round(s / STEP), N) + N + 2) % N) - 2) * STEP);

  function unroll(i: number) {
    setSpin((s) => Math.round(s / STEP) * STEP);
    setFlat(true);
    setSelected(i);
    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 900);
  }
  function rollUp() {
    setFlat(false);
    setSelected(null);
  }

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") flat ? setSelected((s) => mod((s ?? 0) + 1, N)) : setSpin((s) => s + STEP);
      if (e.key === "ArrowLeft") flat ? setSelected((s) => mod((s ?? 0) - 1, N)) : setSpin((s) => s - STEP);
      if (e.key === "Escape" && flat) rollUp();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [flat]);

  // Drag sideways to spin.
  const onPointerDown = (e: React.PointerEvent) => {
    if (flat) return;
    drag.current = { x: e.clientX, spin, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (d.moved) setSpin(d.spin - dx * 0.45);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      setDragging(false);
      setSpin((s) => Math.round(s / STEP) * STEP);
      // swallow the click that follows a drag (and only that one)
      const swallow = (ev: MouseEvent) => ev.stopPropagation();
      window.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 60);
    }
  };

  function faceStyle(i: number): CSSProperties {
    if (!flat) return { transform: `rotateY(${i * STEP}deg) translateZ(var(--a)) translateX(0px)` };
    // Any angle ≡ spin (mod 360) cancels the lantern's rotation; pick the one nearest this face's own.
    const target = spin + 360 * Math.round((i * STEP - spin) / 360);
    return { transform: `rotateY(${target}deg) translateZ(0px) translateX(calc(${i - 2} * var(--w)))` };
  }

  const sel = selected === null ? null : members[selected];

  return (
    <main className="fam">
      <header>
        <h1 className="hand">{FAMILY.title}</h1>
        <p>{FAMILY.subtitle}</p>
      </header>

      <div
        className={`lantern-stage ${flat ? "flat" : ""} ${dragging ? "dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="string" aria-hidden />
        <div className="lantern" style={{ transform: `rotateX(${flat ? 0 : -10}deg) rotateY(${-spin}deg)` }}>
          <div className="cap top" style={{ clipPath: `polygon(${PENTAGON})` }} aria-hidden />
          <div className="cap bottom" style={{ clipPath: `polygon(${PENTAGON})` }} aria-hidden />
          {members.map((m, i) => (
            <button
              key={i}
              className={`face ${selected === i ? "sel" : ""} ${!flat && i === front ? "front" : ""}`}
              style={{ ...faceStyle(i), ["--c" as string]: m.color }}
              onClick={() => (flat ? setSelected(i) : i === front ? unroll(i) : turnTo(i))}
              aria-label={flat ? `${m.name}: show details` : i === front ? `${m.name}: unroll the lantern` : `turn to ${m.name}`}
              tabIndex={flat || i === front ? 0 : -1}
            >
              <Doodle kind={m.doodle} color={m.color} />
              <span className="name hand">{m.name}</span>
              <span className="words">{m.words.join(" · ")}</span>
            </button>
          ))}
        </div>
        <div className="tassel" aria-hidden />
      </div>

      <div className="controls">
        {!flat ? (
          <>
            <button className="btn" onClick={() => setSpin((s) => s - STEP)} aria-label="previous">
              ←
            </button>
            <button className="btn solid" onClick={() => unroll(front)}>
              unroll the lantern
            </button>
            <button className="btn" onClick={() => setSpin((s) => s + STEP)} aria-label="next">
              →
            </button>
          </>
        ) : (
          <button className="btn" onClick={rollUp}>
            roll it back up
          </button>
        )}
      </div>

      {flat && sel && <Card m={sel} innerRef={cardRef} />}
    </main>
  );
}

function Card({ m, innerRef }: { m: Member; innerRef: React.Ref<HTMLDivElement> }) {
  return (
    <article className="card paper" ref={innerRef} style={{ ["--c" as string]: m.color }} key={m.name}>
      <div className="card-head">
        <Doodle kind={m.doodle} color={m.color} />
        <div>
          <h2 className="hand">{m.name}</h2>
          <p className="role">{m.role}</p>
        </div>
      </div>
      <ul className="chips">
        {m.words.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <dl>
        <dt className="hand">lights up about</dt>
        <dd>{m.loves.join(", ")}</dd>
        <dt className="hand">superpower</dt>
        <dd>{m.superpower}</dd>
        <dt className="hand">a perfect sunday</dt>
        <dd>{m.sunday}</dd>
      </dl>
      <blockquote className="hand">“{m.says}”</blockquote>
    </article>
  );
}

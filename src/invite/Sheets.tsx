// Cards that slide up over the map: one event's details, and the RSVP form.
import { useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { INVITE, UI, type Guest, type InviteEvent } from "../invite.config";
import { LangContext, useT, fmtDay, fmtTime, mapsUrl, downloadIcs, sendReply, myReply, type Reply } from "./lib";

export function Sheet({ onClose, accent, label, children }: { onClose: () => void; accent?: string; label: string; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet paper" role="dialog" aria-modal="true" aria-label={label} style={{ borderTopColor: accent }} onClick={(e) => e.stopPropagation()}>
        <button className="sheet-x" onClick={onClose} aria-label="close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function EventCard({ e, onClose, onRsvp }: { e: InviteEvent; onClose: () => void; onRsvp: () => void }) {
  const lang = useContext(LangContext);
  const t = useT();
  return (
    <Sheet onClose={onClose} accent={e.color} label={t(e.name)}>
      <h2 className="hand sheet-title">{t(e.name)}</h2>
      <p className="tagline">{t(e.tagline)}</p>
      <dl className="facts">
        <dt>{t(UI.when)}</dt>
        <dd>
          {fmtDay(e.start, lang)}, {fmtTime(e.start, lang)}
        </dd>
        <dt>{t(UI.where)}</dt>
        <dd>{t(e.venue)}</dd>
        <dt>{t(UI.wear)}</dt>
        <dd>{t(e.dress)}</dd>
      </dl>
      <div className="row">
        <a className="btn" href={mapsUrl(e.address)} target="_blank" rel="noreferrer">
          {t(UI.maps)}
        </a>
        <button className="btn" onClick={() => downloadIcs(e, lang)}>
          {t(UI.calendar)}
        </button>
        <button className="btn solid" onClick={onRsvp}>
          {t(UI.rsvp)}
        </button>
      </div>
    </Sheet>
  );
}

function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        dur: 2.6 + Math.random() * 2,
        color: ["var(--rose)", "var(--marigold)", "#f0c6c0"][i % 3],
        rot: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="petals" aria-hidden>
      {petals.map((p, i) => (
        <span key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, background: p.color, rotate: `${p.rot}deg` }} />
      ))}
    </div>
  );
}

export function Rsvp({ guestKey, guest, events, onClose }: { guestKey: string; guest: Guest; events: InviteEvent[]; onClose: () => void }) {
  const t = useT();
  const lang = useContext(LangContext);
  const prev = myReply();
  const [done, setDone] = useState<Reply | null>(prev);
  const [editing, setEditing] = useState(!prev);
  const [name, setName] = useState(prev?.name ?? (guest.name === INVITE.everyone.name ? "" : guest.name));
  const [counts, setCounts] = useState<Record<string, number>>(() => prev?.events ?? Object.fromEntries(events.map((e) => [e.key, guest.seats])));
  const [food, setFood] = useState<Reply["food"]>(prev?.food ?? "veg");
  const [note, setNote] = useState(prev?.note ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "failed">("idle");

  const anyYes = Object.values(counts).some((n) => n > 0);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!name.trim()) return;
    const reply: Reply = { guestKey, name: name.trim(), events: counts, food, note: note.trim(), at: new Date().toISOString() };
    setStatus("sending");
    try {
      await sendReply(reply);
      setDone(reply);
      setEditing(false);
      setStatus("idle");
    } catch {
      setStatus("failed");
    }
  }

  if (done && !editing) {
    const yes = Object.values(done.events).some((n) => n > 0);
    return (
      <Sheet onClose={onClose} label={t(UI.rsvp)}>
        {yes && <Petals />}
        <h2 className="hand sheet-title">{yes ? t(UI.thanks) : t(UI.thanksNo)}</h2>
        <ul className="summary">
          {events.map((e) => (
            <li key={e.key}>
              <span className="hand">{t(e.name)}</span> · {done.events[e.key] ? `${done.events[e.key]} ✓` : "—"}
            </li>
          ))}
        </ul>
        {!INVITE.rsvpEndpoint && <p className="demo">{t(UI.demo)}</p>}
        <div className="row">
          <button className="btn" onClick={() => setEditing(true)}>
            {t(UI.edit)}
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet onClose={onClose} label={t(UI.rsvp)}>
      <h2 className="hand sheet-title">{t(UI.rsvp)}</h2>
      <p className="tagline">
        {t(UI.rsvpBy)} {fmtDay(INVITE.rsvpBy, lang)}
      </p>
      <form onSubmit={submit} className="rsvp">
        <label>
          <span>{t(UI.yourName)}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </label>

        {events.map((e) => {
          const n = counts[e.key] ?? 0;
          return (
            <fieldset key={e.key} className="ev" style={{ ["--c" as string]: e.color }}>
              <legend>
                <span className="hand">{t(e.name)}</span> <small>{fmtDay(e.start, lang)}</small>
              </legend>
              <div className="choice">
                <button type="button" className={n > 0 ? "on" : ""} aria-pressed={n > 0} onClick={() => setCounts({ ...counts, [e.key]: n || guest.seats })}>
                  {t(UI.yes)}
                </button>
                <button type="button" className={n === 0 ? "on" : ""} aria-pressed={n === 0} onClick={() => setCounts({ ...counts, [e.key]: 0 })}>
                  {t(UI.no)}
                </button>
                {n > 0 && guest.seats > 1 && (
                  <span className="stepper" aria-label={t(UI.howMany)}>
                    <button type="button" onClick={() => setCounts({ ...counts, [e.key]: Math.max(1, n - 1) })} aria-label="one fewer">
                      −
                    </button>
                    <b>{n}</b>
                    <button type="button" onClick={() => setCounts({ ...counts, [e.key]: Math.min(guest.seats, n + 1) })} aria-label="one more">
                      +
                    </button>
                  </span>
                )}
              </div>
            </fieldset>
          );
        })}

        {anyYes && (
          <fieldset className="food">
            <legend>{t(UI.food)}</legend>
            {(["veg", "nonveg", "jain", "vegan"] as const).map((f) => (
              <label key={f} className={food === f ? "on" : ""}>
                <input type="radio" name="food" value={f} checked={food === f} onChange={() => setFood(f)} />
                {t(UI[f])}
              </label>
            ))}
          </fieldset>
        )}

        <label>
          <span>{t(UI.note)}</span>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        {status === "failed" && <p className="demo">{t(UI.failed)}</p>}
        <div className="row">
          <button className="btn solid" disabled={status === "sending"}>
            {status === "sending" ? t(UI.sending) : t(UI.send)}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

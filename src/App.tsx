// wedding-invite: envelope → letter → map of the weekend → RSVP.
import { useEffect, useMemo, useState } from "react";
import { INVITE, UI, type InviteEvent } from "./invite.config";
import { LangContext, resolveGuest, daysUntil, tr, type Lang } from "./invite/lib";
import { Envelope, useEnvelope } from "./invite/Envelope";
import { EventCard, Rsvp } from "./invite/Sheets";
import { Host } from "./invite/Host";
import { useStored } from "./core/store";
import "./invite/invite.css";

export default function App() {
  const search = window.location.search;
  const hostKey = new URLSearchParams(search).get("host");
  const [lang, setLang] = useStored<Lang>("paperfolds.invite.lang", () => (navigator.language?.startsWith("hi") ? "hi" : "en"));
  const { key, guest, events } = useMemo(() => resolveGuest(search), [search]);
  const env = useEnvelope();
  const [event, setEvent] = useState<InviteEvent | null>(null);
  const [rsvp, setRsvp] = useState(false);

  const [a, b] = INVITE.couple;
  useEffect(() => {
    document.title = `${a} & ${b}`;
    document.documentElement.lang = lang;
  }, [a, b, lang]);

  if (hostKey !== null) return <Host hostKey={hostKey} />;

  const t = (v: Parameters<typeof tr>[0]) => tr(v, lang);
  const days = events.length ? daysUntil(events[0].start) : 0;

  return (
    <LangContext.Provider value={lang}>
      <main className="invite">
        <div className="lang" role="group" aria-label="language">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
            EN
          </button>
          <button className={lang === "hi" ? "on" : ""} onClick={() => setLang("hi")} lang="hi">
            हिं
          </button>
        </div>

        <Envelope env={env} guestName={guest.name} events={events} onPin={setEvent} />

        <div className={`caption ${env.at("open") ? "show" : ""}`}>
          {env.stage === "sealed" && <p className="hint hand">{t(UI.tapSeal)}</p>}
          {env.at("open") && (
            <>
              <p className="countdown hand">{days > 0 ? `${days} ${t(UI.daysToGo)}` : days === 0 ? t(UI.today) : ""}</p>
              <p className="hint">{t(UI.tapPin)}</p>
              <div className="row">
                <button className="btn solid" onClick={() => setRsvp(true)}>
                  {t(UI.rsvp)}
                </button>
                <button className="btn" onClick={env.close}>
                  {t(UI.closeLetter)}
                </button>
              </div>
            </>
          )}
        </div>

        {event && (
          <EventCard
            e={event}
            onClose={() => setEvent(null)}
            onRsvp={() => {
              setEvent(null);
              setRsvp(true);
            }}
          />
        )}
        {rsvp && <Rsvp guestKey={key} guest={guest} events={events} onClose={() => setRsvp(false)} />}
      </main>
    </LangContext.Provider>
  );
}

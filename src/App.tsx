// house-hunting: a pop-up 3BHK plan, a must / dream checklist per room, and every house you see scored against it.
import { useEffect, useRef, useState } from "react";
import { useStored } from "./core/store";
import { Plan } from "./house/Plan";
import { RoomChecklist, ListingCard, Compare } from "./house/Panel";
import { STORE_KEY, defaultHunt, newListing, totalScore, pct, exportHunt, importHunt, type Hunt } from "./house/state";
import "./house/house.css";

export default function App() {
  const [hunt, setHuntRaw] = useStored<Hunt>(STORE_KEY, defaultHunt);
  const setHunt = (fn: (h: Hunt) => Hunt) => setHuntRaw((h) => fn(h));
  const [listingId, setListingId] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>("house");
  const [compare, setCompare] = useState(false);
  const [tilted, setTilted] = useState(false);
  const [popped, setPopped] = useState(false);
  const [view3d, setView3d] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Intro: the sheet tilts back, then the walls fold up.
  useEffect(() => {
    document.title = "the house hunt";
    const a = setTimeout(() => setTilted(true), 250);
    const b = setTimeout(() => setPopped(true), 900);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const listing = hunt.listings.find((l) => l.id === listingId) ?? null;

  function pickListing(id: string | null) {
    setListingId(id);
    setCompare(false);
    setRoom(id ? null : "house");
  }
  function pickRoom(id: string) {
    setRoom(id);
    setCompare(false);
    // On phones the card is below the plan: bring it into view.
    if (window.innerWidth < 900) setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }
  function addHouse() {
    const l = newListing(hunt.listings.length + 1);
    setHunt((h) => ({ ...h, listings: [...h.listings, l] }));
    pickListing(l.id);
  }

  return (
    <main className="hunt">
      <header className="top">
        <h1 className="hand">the house hunt</h1>
        <p className="sub">3 bedrooms, each with its own washroom · a common washroom · kitchen · hall · dining · front &amp; back balconies</p>
        <nav className="chips" aria-label="houses">
          <button className={!listing && !compare ? "on" : ""} onClick={() => pickListing(null)}>
            my checklist
          </button>
          {hunt.listings.map((l) => {
            const s = totalScore(hunt, l);
            return (
              <button key={l.id} className={listing?.id === l.id && !compare ? "on" : ""} onClick={() => pickListing(l.id)}>
                {l.name} <small>{pct(s.must, s.mustOf)}%</small>
              </button>
            );
          })}
          <button className="add" onClick={addHouse}>
            + a house we saw
          </button>
          {hunt.listings.length > 1 && (
            <button className={compare ? "on" : ""} onClick={() => setCompare(true)}>
              compare
            </button>
          )}
        </nav>
      </header>

      <div className="layout">
        <section className="plan-col">
          <Plan hunt={hunt} listing={listing} selected={compare ? null : room} onSelect={pickRoom} tilted={tilted && view3d} popped={popped && view3d} />
          <div className="plan-tools">
            <button className="btn" onClick={() => setView3d((v) => !v)}>
              {view3d ? "flat plan" : "pop it up"}
            </button>
            <button className="btn" onClick={() => pickRoom("house")}>
              the whole house
            </button>
            {listing && (
              <span className="legend">
                <span className="cell st-great" /> all <span className="cell st-ok" /> musts <span className="cell st-missing" /> missing
              </span>
            )}
          </div>
        </section>

        <aside className="panel paper" ref={panelRef}>
          {compare ? (
            <Compare hunt={hunt} onPick={pickListing} />
          ) : room ? (
            <>
              {listing && (
                <button className="back" onClick={() => setRoom(null)}>
                  ← {listing.name}
                </button>
              )}
              <RoomChecklist roomId={room} hunt={hunt} setHunt={setHunt} listing={listing} />
            </>
          ) : listing ? (
            <ListingCard
              listing={listing}
              hunt={hunt}
              setHunt={setHunt}
              onSelectRoom={pickRoom}
              onDelete={() => {
                setHunt((h) => ({ ...h, listings: h.listings.filter((l) => l.id !== listing.id) }));
                pickListing(null);
              }}
            />
          ) : null}
        </aside>
      </div>

      <footer className="foot">
        <span>saved in this browser.</span>
        <button className="link" onClick={() => exportHunt(hunt)}>
          export
        </button>
        <button className="link" onClick={() => fileRef.current?.click()}>
          import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              const h = await importHunt(f);
              setHuntRaw(h);
              pickListing(null);
            } catch {
              alert("That file isn't a house-hunt export.");
            }
          }}
        />
        <button
          className="link"
          onClick={() => {
            if (confirm("Reset the checklist to the defaults? Your houses are kept.")) setHunt((h) => ({ ...defaultHunt(), listings: h.listings }));
          }}
        >
          reset checklist
        </button>
      </footer>
    </main>
  );
}

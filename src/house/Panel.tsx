// The side card: a room's checklist (edit it, or tick what a house has), the house's
// details, and the compare table.
import { useState } from "react";
import { ROOMS, type Tier } from "../house.config";
import { uid } from "../core/store";
import { score, totalScore, rank, pct, roomState, type Hunt, type Item, type Listing } from "./state";

const TIER_LABEL: Record<Tier, { title: string; hint: string }> = {
  must: { title: "must-haves", hint: "realistic: walk away without these" },
  dream: { title: "dream", hint: "would make it feel like ours" },
};

type SetHunt = (fn: (h: Hunt) => Hunt) => void;

export function RoomChecklist({ roomId, hunt, setHunt, listing }: { roomId: string; hunt: Hunt; setHunt: SetHunt; listing: Listing | null }) {
  const room = ROOMS.find((r) => r.id === roomId)!;
  const items = hunt.items[roomId] ?? [];
  const s = listing ? score(items, listing) : null;

  const setItems = (fn: (it: Item[]) => Item[]) => setHunt((h) => ({ ...h, items: { ...h.items, [roomId]: fn(h.items[roomId] ?? []) } }));
  const toggleHas = (id: string) =>
    setHunt((h) => ({ ...h, listings: h.listings.map((l) => (l.id === listing!.id ? { ...l, has: { ...l.has, [id]: !l.has[id] } } : l)) }));

  return (
    <div className="room-card">
      <h2 className="hand">{room.name}</h2>
      {listing ? (
        <p className="sub">
          does <b>{listing.name}</b> have it? {s && <span className="pill">{s.must}/{s.mustOf} musts · {s.dream}/{s.dreamOf} dreams</span>}
        </p>
      ) : (
        <p className="sub">your checklist for this room. pick a house above to tick it off.</p>
      )}
      {(["must", "dream"] as Tier[]).map((tier) => (
        <TierList
          key={tier}
          tier={tier}
          items={items.filter((i) => i.tier === tier)}
          listing={listing}
          onToggle={toggleHas}
          onAdd={(text) => setItems((it) => [...it, { id: uid(), text, tier }])}
          onRemove={(id) => setItems((it) => it.filter((x) => x.id !== id))}
          onMove={(id) => setItems((it) => it.map((x) => (x.id === id ? { ...x, tier: x.tier === "must" ? "dream" : "must" } : x)))}
        />
      ))}
    </div>
  );
}

function TierList({
  tier,
  items,
  listing,
  onToggle,
  onAdd,
  onRemove,
  onMove,
}: {
  tier: Tier;
  items: Item[];
  listing: Listing | null;
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <section className={`tier ${tier}`}>
      <h3>
        <span className="hand">{TIER_LABEL[tier].title}</span> <small>{TIER_LABEL[tier].hint}</small>
      </h3>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            {listing ? (
              <label className={`tick ${listing.has[it.id] ? "on" : ""}`}>
                <input type="checkbox" checked={!!listing.has[it.id]} onChange={() => onToggle(it.id)} />
                <span className="box" aria-hidden />
                {it.text}
              </label>
            ) : (
              <>
                <span className="dot" aria-hidden />
                <span className="text">{it.text}</span>
                <button className="mini" onClick={() => onMove(it.id)} title={tier === "must" ? "move to dream" : "move to must-haves"} aria-label={tier === "must" ? `move "${it.text}" to dream` : `move "${it.text}" to must-haves`}>
                  {tier === "must" ? "↓" : "↑"}
                </button>
                <button className="mini" onClick={() => onRemove(it.id)} aria-label={`remove "${it.text}"`}>
                  ×
                </button>
              </>
            )}
          </li>
        ))}
        {!items.length && <li className="empty">nothing yet</li>}
      </ul>
      {!listing && (
        <form
          className="add-item"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) onAdd(draft.trim());
            setDraft("");
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`add a ${tier === "must" ? "must-have" : "dream"}…`} aria-label={`add a ${tier} item`} />
          <button className="mini" aria-label="add">
            +
          </button>
        </form>
      )}
    </section>
  );
}

export function ListingCard({ listing, hunt, setHunt, onSelectRoom, onDelete }: { listing: Listing; hunt: Hunt; setHunt: SetHunt; onSelectRoom: (id: string) => void; onDelete: () => void }) {
  const set = (patch: Partial<Listing>) => setHunt((h) => ({ ...h, listings: h.listings.map((l) => (l.id === listing.id ? { ...l, ...patch } : l)) }));
  const t = totalScore(hunt, listing);
  const missing = ROOMS.flatMap((r) => (hunt.items[r.id] ?? []).filter((i) => i.tier === "must" && !listing.has[i.id]).map((i) => ({ room: r, item: i })));

  return (
    <div className="room-card">
      <input className="title-input hand" value={listing.name} onChange={(e) => set({ name: e.target.value })} aria-label="house name" />
      <div className="meter" aria-label={`${pct(t.must, t.mustOf)}% of must-haves`}>
        <div className="bar must" style={{ width: `${pct(t.must, t.mustOf)}%` }} />
        <span>
          {t.must}/{t.mustOf} must-haves · {t.dream}/{t.dreamOf} dreams
        </span>
      </div>
      <div className="fields">
        <label>
          <span>area / society</span>
          <input value={listing.locality} onChange={(e) => set({ locality: e.target.value })} />
        </label>
        <label>
          <span>price / rent</span>
          <input value={listing.price} onChange={(e) => set({ price: e.target.value })} placeholder="45k/month" />
        </label>
        <label>
          <span>size</span>
          <input value={listing.sqft} onChange={(e) => set({ sqft: e.target.value })} placeholder="1450 sq ft" />
        </label>
        <label>
          <span>seen on</span>
          <input type="date" value={listing.seen} onChange={(e) => set({ seen: e.target.value })} />
        </label>
        <label className="wide">
          <span>listing link</span>
          <input value={listing.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://…" inputMode="url" />
        </label>
        <label className="wide">
          <span>gut feeling</span>
          <span className="stars" role="radiogroup" aria-label="gut feeling">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} role="radio" aria-checked={listing.stars === n} className={n <= listing.stars ? "on" : ""} onClick={() => set({ stars: listing.stars === n ? 0 : n })} aria-label={`${n} of 5`}>
                ★
              </button>
            ))}
          </span>
        </label>
        <label className="wide">
          <span>notes</span>
          <textarea rows={3} value={listing.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="broker's name, smell of paint, the neighbour's dog…" />
        </label>
      </div>

      <h3 className="hand">room by room</h3>
      <ul className="room-list">
        {ROOMS.map((r) => {
          const items = hunt.items[r.id] ?? [];
          const s = score(items, listing);
          return (
            <li key={r.id}>
              <button className={`st-${roomState(items, listing)}`} onClick={() => onSelectRoom(r.id)}>
                <span>{r.name}</span>
                <small>
                  {s.must}/{s.mustOf} · ✦{s.dream}/{s.dreamOf}
                </small>
              </button>
            </li>
          );
        })}
      </ul>
      {missing.length > 0 && (
        <>
          <h3 className="hand">still missing</h3>
          <ul className="missing">
            {missing.map(({ room, item }) => (
              <li key={item.id}>
                <b>{room.name}:</b> {item.text}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="row">
        {listing.link && /^https?:\/\//.test(listing.link) && (
          <a className="btn" href={listing.link} target="_blank" rel="noreferrer">
            open listing
          </a>
        )}
        <button
          className="btn danger"
          onClick={() => {
            if (confirm(`Remove ${listing.name}?`)) onDelete();
          }}
        >
          remove house
        </button>
      </div>
    </div>
  );
}

export function Compare({ hunt, onPick }: { hunt: Hunt; onPick: (id: string) => void }) {
  const rows = hunt.listings.map((l) => ({ l, s: totalScore(hunt, l) })).sort((a, b) => rank(b.s) - rank(a.s) || b.l.stars - a.l.stars);
  if (!rows.length) return <p className="sub">add a house first.</p>;
  return (
    <div className="compare">
      <table>
        <thead>
          <tr>
            <th>house</th>
            <th>must-haves</th>
            <th>dreams</th>
            <th>gut</th>
            <th>price</th>
            <th>size</th>
            {ROOMS.map((r) => (
              <th key={r.id} className="vert">
                <span>{r.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ l, s }, i) => (
            <tr key={l.id}>
              <td>
                <button className="link hand" onClick={() => onPick(l.id)}>
                  {i === 0 && rows.length > 1 ? "★ " : ""}
                  {l.name}
                </button>
                {l.locality && <small>{l.locality}</small>}
              </td>
              <td>
                <span className="meter tiny">
                  <span className="bar must" style={{ width: `${pct(s.must, s.mustOf)}%` }} />
                </span>
                {pct(s.must, s.mustOf)}%
              </td>
              <td>{pct(s.dream, s.dreamOf)}%</td>
              <td>{"★".repeat(l.stars) || "—"}</td>
              <td>{l.price || "—"}</td>
              <td>{l.sqft || "—"}</td>
              {ROOMS.map((r) => (
                <td key={r.id}>
                  <span className={`cell st-${roomState(hunt.items[r.id] ?? [], l)}`} title={r.name} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="legend">
        <span className="cell st-great" /> every item <span className="cell st-ok" /> musts met <span className="cell st-missing" /> a must is missing
      </p>
    </div>
  );
}

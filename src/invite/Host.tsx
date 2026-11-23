// The couple's view: ?host=<HOST_KEY>. Headcount per event, food totals, every reply.
import { useEffect, useState } from "react";
import { INVITE } from "../invite.config";
import { fetchReplies, tr, type Reply } from "./lib";

export function Host({ hostKey }: { hostKey: string }) {
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReplies(hostKey).then(setReplies, (e) => setError(String(e.message ?? e)));
  }, [hostKey]);

  const [a, b] = INVITE.couple;
  // Latest reply per person wins.
  const latest = Object.values(
    (replies ?? []).reduce<Record<string, Reply>>((acc, r) => {
      const k = `${r.guestKey}|${r.name.toLowerCase()}`;
      if (!acc[k] || acc[k].at < r.at) acc[k] = r;
      return acc;
    }, {}),
  ).sort((x, y) => y.at.localeCompare(x.at));

  const food: Record<string, number> = {};
  for (const r of latest) {
    const most = Math.max(0, ...Object.values(r.events));
    if (most) food[r.food] = (food[r.food] ?? 0) + most;
  }

  return (
    <main className="host">
      <h1 className="hand">
        {a} &amp; {b}: replies
      </h1>
      {!INVITE.rsvpEndpoint && <p className="demo">No rsvpEndpoint set in invite.config.ts, so this only shows replies made on this device.</p>}
      {error && <p className="demo">Couldn't load replies ({error}). Check the host key and that the Apps Script is deployed for "Anyone".</p>}
      {!replies && !error && <p>loading…</p>}
      {replies && (
        <>
          <div className="tallies">
            {INVITE.events.map((e) => {
              const yes = latest.reduce((n, r) => n + (r.events[e.key] ?? 0), 0);
              return (
                <div key={e.key} className="tally paper" style={{ borderTopColor: e.color }}>
                  <b className="hand">{yes}</b>
                  <span>{tr(e.name, "en")}</span>
                </div>
              );
            })}
            <div className="tally paper">
              <b className="hand">{latest.length}</b>
              <span>replies</span>
            </div>
          </div>
          <p className="food-line">
            food: {Object.entries(food).map(([k, n]) => `${k} ${n}`).join(" · ") || "—"}
          </p>
          <div className="table-wrap paper">
            <table>
              <thead>
                <tr>
                  <th>name</th>
                  <th>link</th>
                  {INVITE.events.map((e) => (
                    <th key={e.key}>{tr(e.name, "en")}</th>
                  ))}
                  <th>food</th>
                  <th>note</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>{r.guestKey}</td>
                    {INVITE.events.map((e) => (
                      <td key={e.key}>{r.events[e.key] === undefined ? "" : r.events[e.key] || "no"}</td>
                    ))}
                    <td>{r.food}</td>
                    <td>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

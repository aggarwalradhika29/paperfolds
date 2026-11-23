import { createContext, useContext } from "react";
import { INVITE, type Guest, type InviteEvent, type Text } from "../invite.config";
import { load, save } from "../core/store";

export type Lang = "en" | "hi";
export const LangContext = createContext<Lang>("en");

export const tr = (v: Text, lang: Lang) => (typeof v === "string" ? v : v[lang]);

/** Hook: returns a translator bound to the current language. */
export function useT() {
  const lang = useContext(LangContext);
  return (v: Text) => tr(v, lang);
}

/** Who this link is for, and which events they see. Reads ?g=<slug> and ?to=<name>. */
export function resolveGuest(search: string): { key: string; guest: Guest; events: InviteEvent[] } {
  const q = new URLSearchParams(search);
  const slug = q.get("g") ?? "";
  const known = INVITE.guests[slug];
  const guest: Guest = known ?? { ...INVITE.everyone, name: q.get("to")?.trim() || INVITE.everyone.name };
  const events = INVITE.events.filter((e) => !guest.events || guest.events.includes(e.key));
  return { key: known ? slug : q.get("to") ? `to:${guest.name}` : "open", guest, events };
}

const locale = (lang: Lang) => (lang === "hi" ? "hi-IN" : "en-IN");

export function fmtDay(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(locale(lang), { weekday: "long", day: "numeric", month: "long" });
}
export function fmtTime(iso: string, lang: Lang) {
  return new Date(iso).toLocaleTimeString(locale(lang), { hour: "numeric", minute: "2-digit" });
}
export function fmtRange(events: InviteEvent[], lang: Lang) {
  if (!events.length) return "";
  const a = new Date(events[0].start);
  const b = new Date(events[events.length - 1].start);
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString(locale(lang), o);
  if (a.toDateString() === b.toDateString()) return f(a, { day: "numeric", month: "long", year: "numeric" });
  return `${f(a, { day: "numeric" })}–${f(b, { day: "numeric", month: "long", year: "numeric" })}`;
}

export function daysUntil(iso: string) {
  const start = new Date(iso);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((start.getTime() - now.getTime()) / 86400000);
}

export const mapsUrl = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** Download a .ics for one event. Times are "floating" (local to wherever the wedding is). */
export function downloadIcs(e: InviteEvent, lang: Lang) {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").slice(0, 13) + "00";
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  const [a, b] = INVITE.couple;
  const now = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//paperfolds//wedding-invite//EN",
    "BEGIN:VEVENT",
    `UID:${e.key}-${a}-${b}@paperfolds`.replace(/\s/g, ""),
    `DTSTAMP:${now}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    `SUMMARY:${esc(`${tr(e.name, lang)} · ${a} & ${b}`)}`,
    `LOCATION:${esc(`${tr(e.venue, lang)}, ${e.address}`)}`,
    `DESCRIPTION:${esc(`${tr(e.tagline, lang)}\n${tr(e.dress, lang)}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${e.key}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── RSVP ──────────────────────────────────────────────────────────────────────

export type Reply = {
  guestKey: string;
  name: string;
  /** eventKey → number attending (0 = not coming). */
  events: Record<string, number>;
  food: "veg" | "nonveg" | "jain" | "vegan";
  note: string;
  at: string;
};

const MINE = "paperfolds.invite.reply";
const DEMO = "paperfolds.invite.demoReplies";

export const myReply = () => load<Reply | null>(MINE, null);
export const demoReplies = () => load<Reply[]>(DEMO, []);

/** Send a reply to the Apps Script, or keep it on this device when no endpoint is set. */
export async function sendReply(r: Reply) {
  if (INVITE.rsvpEndpoint) {
    // text/plain + no-cors keeps it a "simple" request, which Apps Script accepts without CORS preflight.
    await fetch(INVITE.rsvpEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(r) });
  } else {
    save(DEMO, [...demoReplies().filter((x) => x.guestKey !== r.guestKey || x.name !== r.name), r]);
  }
  save(MINE, r);
}

/** Host view: every reply. Needs the HOST_KEY set on the Apps Script. */
export async function fetchReplies(key: string): Promise<Reply[]> {
  if (!INVITE.rsvpEndpoint) return demoReplies();
  const res = await fetch(`${INVITE.rsvpEndpoint}?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.replies as Reply[];
}

// The hunt's data: your checklist (per room, must vs dream) and the houses you've seen.
// Saved in this browser; Export / Import moves it between devices or to family.
import { ROOMS, type Tier } from "../house.config";
import { uid } from "../core/store";

export type Item = { id: string; text: string; tier: Tier };

export type Listing = {
  id: string;
  name: string;
  locality: string;
  /** Rent per month or price, as typed ("45k/month", "1.2 Cr"). */
  price: string;
  sqft: string;
  link: string;
  notes: string;
  /** 0–5 gut feeling. */
  stars: number;
  /** itemId → this house has it. */
  has: Record<string, boolean>;
  seen: string;
};

export type Hunt = { version: 1; items: Record<string, Item[]>; listings: Listing[] };

export const STORE_KEY = "paperfolds.house.v1";

export function defaultHunt(): Hunt {
  const items: Record<string, Item[]> = {};
  for (const r of ROOMS) {
    items[r.id] = [
      ...r.must.map((text, i) => ({ id: `${r.id}-m${i}`, text, tier: "must" as const })),
      ...r.dream.map((text, i) => ({ id: `${r.id}-d${i}`, text, tier: "dream" as const })),
    ];
  }
  return { version: 1, items, listings: [] };
}

export function newListing(n: number): Listing {
  return { id: uid(), name: `house ${n}`, locality: "", price: "", sqft: "", link: "", notes: "", stars: 0, has: {}, seen: new Date().toISOString().slice(0, 10) };
}

export type Score = { must: number; mustOf: number; dream: number; dreamOf: number };

export function score(items: Item[], l: Listing): Score {
  const s: Score = { must: 0, mustOf: 0, dream: 0, dreamOf: 0 };
  for (const it of items) {
    if (it.tier === "must") {
      s.mustOf++;
      if (l.has[it.id]) s.must++;
    } else {
      s.dreamOf++;
      if (l.has[it.id]) s.dream++;
    }
  }
  return s;
}

export function totalScore(h: Hunt, l: Listing): Score {
  return score(Object.values(h.items).flat(), l);
}

/** One number to sort by: must-haves count three times as much as dreams. */
export const rank = (s: Score) => (s.mustOf ? (s.must / s.mustOf) * 0.75 : 0.75) + (s.dreamOf ? (s.dream / s.dreamOf) * 0.25 : 0);

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 100);

/** How well a room does for a listing: all musts met, some missing, or none of anything. */
export function roomState(items: Item[], l: Listing): "great" | "ok" | "missing" | "empty" {
  if (!items.length) return "empty";
  const s = score(items, l);
  if (s.must < s.mustOf) return "missing";
  return s.dream === s.dreamOf ? "great" : "ok";
}

export function exportHunt(h: Hunt) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(h, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `house-hunt-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importHunt(file: File): Promise<Hunt> {
  const h = JSON.parse(await file.text()) as Hunt;
  if (h.version !== 1 || typeof h.items !== "object" || !Array.isArray(h.listings)) throw new Error("not a house-hunt file");
  return h;
}

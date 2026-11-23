// ─────────────────────────────────────────────────────────────────────────────
//  The house you're hunting for: its rooms, where they sit on the plan, and the
//  starting checklist for each. Everything here is just the default: the app lets
//  you add, remove and move items, and saves your version in the browser.
// ─────────────────────────────────────────────────────────────────────────────

export type Tier = "must" | "dream";
export type RoomKind = "bed" | "bath" | "kitchen" | "living" | "dining" | "balcony" | "house";

export type RoomDef = {
  id: string;
  name: string;
  kind: RoomKind;
  /** Position on the plan, in plan units (the plan is PLAN.w × PLAN.h). Omit for "whole house". */
  box?: [x: number, y: number, w: number, h: number];
  must: string[];
  dream: string[];
};

/** The plan is 100 × 72 units. Top edge = back of the house, bottom edge = front. */
export const PLAN = { w: 100, h: 72 };

/** Floor that isn't a room (no checklist), so the plan has no holes. */
export const PASSAGES: { label: string; box: [number, number, number, number] }[] = [{ label: "entry", box: [40, 46, 24, 16] }];

export const ROOMS: RoomDef[] = [
  {
    id: "house",
    name: "the whole house",
    kind: "house",
    must: [
      "within budget (incl. brokerage & maintenance)",
      "commute under 45 min",
      "24-hour water supply",
      "power backup for lights & fans",
      "lift, if above the 2nd floor",
      "covered car parking",
      "gated, with security",
      "no damp patches or seepage on walls",
    ],
    dream: ["park or clubhouse in the society", "pets allowed", "east or north facing", "top-ish floor, no one stomping above", "market within walking distance"],
  },
  {
    id: "bed1",
    name: "bedroom 1",
    kind: "bed",
    box: [0, 0, 28, 30],
    must: ["fits a king bed + wardrobe", "a window that opens", "AC point", "attached washroom"],
    dream: ["walk-in wardrobe", "morning sun", "space for a reading chair"],
  },
  {
    id: "bath1",
    name: "washroom 1",
    kind: "bath",
    box: [28, 0, 12, 15],
    must: ["window or exhaust fan", "geyser point", "good water pressure"],
    dream: ["separate dry and wet area", "shower glass partition"],
  },
  {
    id: "common",
    name: "common washroom",
    kind: "bath",
    box: [28, 15, 12, 15],
    must: ["opens off the hall, not a bedroom", "window or exhaust fan", "geyser point"],
    dream: ["western + health faucet", "space for a small cabinet"],
  },
  {
    id: "backbal",
    name: "back balcony",
    kind: "balcony",
    box: [40, 0, 24, 8],
    must: ["washing machine point with water inlet", "space to dry clothes"],
    dream: ["covered from rain", "room for a few plants"],
  },
  {
    id: "kitchen",
    name: "kitchen",
    kind: "kitchen",
    box: [40, 8, 24, 22],
    must: ["L or U shaped counter", "chimney / exhaust point", "piped gas (PNG)", "space for a double-door fridge", "RO purifier point"],
    dream: ["modular cabinets already fitted", "window over the sink", "space for a breakfast counter"],
  },
  {
    id: "bath2",
    name: "washroom 2",
    kind: "bath",
    box: [64, 0, 12, 15],
    must: ["window or exhaust fan", "geyser point", "good water pressure"],
    dream: ["separate dry and wet area"],
  },
  {
    id: "bed2",
    name: "bedroom 2",
    kind: "bed",
    box: [76, 0, 24, 30],
    must: ["fits a queen bed + wardrobe", "a window that opens", "AC point", "attached washroom"],
    dream: ["study table by the window", "balcony access"],
  },
  {
    id: "living",
    name: "living / hall",
    kind: "living",
    box: [0, 30, 40, 32],
    must: ["lots of natural light", "fits a 3-seater sofa + TV wall", "main door doesn't open straight into the kitchen"],
    dream: ["high ceiling", "space for a pooja corner", "opens onto the front balcony"],
  },
  {
    id: "dining",
    name: "dining",
    kind: "dining",
    box: [40, 30, 24, 16],
    must: ["fits a 6-seater table", "right next to the kitchen"],
    dream: ["wall for a crockery unit", "pendant light point over the table"],
  },
  {
    id: "bed3",
    name: "bedroom 3",
    kind: "bed",
    box: [64, 30, 24, 32],
    must: ["fits a queen bed + wardrobe", "a window that opens", "attached washroom"],
    dream: ["could double as a guest room / study", "AC point"],
  },
  {
    id: "bath3",
    name: "washroom 3",
    kind: "bath",
    box: [88, 30, 12, 32],
    must: ["window or exhaust fan", "geyser point"],
    dream: ["shower glass partition"],
  },
  {
    id: "frontbal",
    name: "front balcony",
    kind: "balcony",
    box: [0, 62, 100, 10],
    must: ["safe railing height", "not looking straight into a neighbour's window"],
    dream: ["room for a swing or two chairs", "sunset view", "greenery outside"],
  },
];

/** Floor colours per room kind (watercolour wash). */
export const KIND_COLOR: Record<RoomKind, string> = {
  bed: "#e9c9b8",
  bath: "#bcd3df",
  kitchen: "#efd59c",
  living: "#d8cfe3",
  dining: "#f0dcc0",
  balcony: "#c9dcc0",
  house: "#e9dfcb",
};

// ─────────────────────────────────────────────────────────────────────────────
//  The five of us. Swap these placeholders for your family: one entry per face
//  of the lantern, in the order you want them to go round.
// ─────────────────────────────────────────────────────────────────────────────

export type Doodle = "wrench" | "plant" | "laptop" | "music" | "cricket" | "book" | "coffee" | "camera";

export type Member = {
  name: string;
  /** A line under the name: "the planner", "the youngest"… */
  role: string;
  /** Three words that are so them. Shown on the lantern face. */
  words: [string, string, string];
  /** What they light up about. */
  loves: string[];
  superpower: string;
  sunday: string;
  /** The thing they always say. */
  says: string;
  /** Watercolour of their panel. */
  color: string;
  doodle: Doodle;
};

export const FAMILY = {
  title: "the five of us",
  subtitle: "one lantern, five sides. spin it, then let it unroll.",
  members: [
    {
      name: "Papa",
      role: "the planner",
      words: ["calm", "punctual", "secretly funny"],
      loves: ["early morning walks", "old Kishore Kumar songs", "the Sunday crossword"],
      superpower: "can fix anything with one screwdriver",
      sunday: "newspaper, chai, then a long nap he says he didn't take",
      says: "did you lock the door?",
      color: "#7fa6c4",
      doodle: "wrench",
    },
    {
      name: "Mummy",
      role: "the heart of the house",
      words: ["warm", "fierce", "organised"],
      loves: ["her balcony garden", "chai at exactly 5", "feeding everyone twice"],
      superpower: "knows where everything is, always",
      sunday: "a big lunch for whoever shows up, and somehow always enough",
      says: "have you eaten?",
      color: "#8fae8b",
      doodle: "plant",
    },
    {
      name: "Me",
      role: "the builder",
      words: ["curious", "stubborn", "night owl"],
      loves: ["building things on the internet", "strong coffee", "half-finished side projects"],
      superpower: "turns an idea into an app overnight",
      sunday: "coding in pyjamas till someone calls me for lunch",
      says: "just five more minutes",
      color: "#8f6a9a",
      doodle: "laptop",
    },
    {
      name: "Didi",
      role: "the style department",
      words: ["honest", "dramatic", "loyal"],
      loves: ["perfect playlists", "planning trips", "sketching on napkins"],
      superpower: "makes any outfit work",
      sunday: "a café, a sketchbook and a very long phone call",
      says: "trust me on this",
      color: "#d9776f",
      doodle: "music",
    },
    {
      name: "Chhotu",
      role: "the youngest",
      words: ["cheeky", "sporty", "always hungry"],
      loves: ["gully cricket", "video games", "maggi at midnight"],
      superpower: "finishes every snack in the house",
      sunday: "cricket till it's too dark to see the ball",
      says: "what's for dinner?",
      color: "#e9a93b",
      doodle: "cricket",
    },
  ] satisfies Member[] as Member[],
};

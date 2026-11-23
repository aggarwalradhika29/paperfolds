// ─────────────────────────────────────────────────────────────────────────────
//  Everything the invite says lives here. Change names, dates, places and guests;
//  the envelope, the map and the RSVP form all read from this file.
// ─────────────────────────────────────────────────────────────────────────────

/** A string in both languages, or one string used for both. */
export type Text = string | { en: string; hi: string };

export type Venue = "courtyard" | "mandap" | "hall" | "lawn";

export type InviteEvent = {
  key: string;
  name: Text;
  tagline: Text;
  /** Local date-time, no zone: "2027-02-11T10:00". */
  start: string;
  end: string;
  venue: Text;
  /** Used for the Google Maps link. */
  address: string;
  dress: Text;
  /** Watercolour of the pin and card. */
  color: string;
  /** Which little building is drawn at the pin. */
  drawing: Venue;
  /** Where the pin sits on the 600 × 600 map. */
  at: [number, number];
};

export type Guest = {
  /** How the envelope addresses them. */
  name: string;
  /** Which events they're invited to (keys from `events`). Omit for all. */
  events?: string[];
  /** Most people they can RSVP for, themselves included. */
  seats: number;
};

export const INVITE = {
  couple: ["Aanya", "Kabir"] as const,
  initials: "A K",
  city: { en: "Udaipur", hi: "उदयपुर" } as Text,
  hosts: {
    en: "together with their families, invite you to celebrate their wedding",
    hi: "अपने परिवारों के साथ, आपको अपने विवाह के उत्सव में सादर आमंत्रित करते हैं",
  } as Text,
  rsvpBy: "2027-01-15",

  /**
   * Where RSVPs go. Paste the web-app URL of the Apps Script in `apps-script/Code.gs`
   * (see the README). Leave empty and RSVPs are kept in the guest's browser only: fine
   * for trying it out, useless for a real wedding.
   */
  rsvpEndpoint: "",

  events: [
    {
      key: "haldi",
      name: { en: "Haldi", hi: "हल्दी" },
      tagline: { en: "come get a little yellow", hi: "थोड़ा पीला होने आइए" },
      start: "2027-02-11T10:00",
      end: "2027-02-11T13:00",
      venue: { en: "the courtyard, Neem Haveli", hi: "आँगन, नीम हवेली" },
      address: "Neem Haveli, Lake Pichola, Udaipur",
      dress: { en: "yellow, and clothes you don't mind ruining", hi: "पीला, और ऐसे कपड़े जो ख़राब हो सकें" },
      color: "var(--marigold)",
      drawing: "courtyard",
      at: [140, 225],
    },
    {
      key: "sangeet",
      name: { en: "Sangeet", hi: "संगीत" },
      tagline: { en: "two families, one dance floor", hi: "दो परिवार, एक डांस फ़्लोर" },
      start: "2027-02-12T19:30",
      end: "2027-02-13T01:00",
      venue: { en: "the lawns, Neem Haveli", hi: "लॉन, नीम हवेली" },
      address: "Neem Haveli, Lake Pichola, Udaipur",
      dress: { en: "sequins, colour, dancing shoes", hi: "चमक, रंग, और नाचने वाले जूते" },
      color: "var(--plum)",
      drawing: "lawn",
      at: [462, 205],
    },
    {
      key: "wedding",
      name: { en: "The Wedding", hi: "विवाह" },
      tagline: { en: "seven steps, one forever", hi: "सात फेरे, एक हमेशा" },
      start: "2027-02-13T18:00",
      end: "2027-02-13T23:00",
      venue: { en: "the mandap by the lake", hi: "झील किनारे मंडप" },
      address: "Neem Haveli, Lake Pichola, Udaipur",
      dress: { en: "traditional; reds and golds welcome", hi: "पारंपरिक; लाल और सुनहरा" },
      color: "var(--rose)",
      drawing: "mandap",
      at: [318, 360],
    },
    {
      key: "reception",
      name: { en: "Reception", hi: "रिसेप्शन" },
      tagline: { en: "dinner, cake and one last dance", hi: "खाना, केक और आख़िरी डांस" },
      start: "2027-02-14T20:00",
      end: "2027-02-14T23:30",
      venue: { en: "the Durbar Hall, Lakeside Palace", hi: "दरबार हॉल, लेकसाइड पैलेस" },
      address: "Lakeside Palace, Udaipur",
      dress: { en: "black tie, ivory and champagne", hi: "ब्लैक टाई, आइवरी और शैम्पेन" },
      color: "var(--sky)",
      drawing: "hall",
      at: [455, 500],
    },
  ] satisfies InviteEvent[] as InviteEvent[],

  /**
   * Personal links: https://<site>/wedding-invite/?g=sharma-family
   * The key is the slug in the link. Anyone without a known slug gets `everyone`.
   * You can also write a name on the envelope for a one-off link: ?to=Meera%20Aunty
   */
  guests: {
    "sharma-family": { name: "the Sharma family", seats: 4 },
    "college-gang": { name: "the college gang", events: ["sangeet", "wedding", "reception"], seats: 1 },
    "office": { name: "our friends from work", events: ["reception"], seats: 2 },
  } as Record<string, Guest>,
  everyone: { name: "you", seats: 2 } as Guest,
};

/** Interface text. Add a language by adding a column here and to `Text`. */
export const UI = {
  for: { en: "for", hi: "प्रिय" },
  tapSeal: { en: "tap the seal to open", hi: "खोलने के लिए मुहर दबाएँ" },
  daysToGo: { en: "days to go", hi: "दिन बाकी" },
  today: { en: "it's today!", hi: "आज ही है!" },
  tapPin: { en: "tap a pin to see each event", hi: "हर समारोह देखने के लिए पिन दबाएँ" },
  rsvp: { en: "RSVP", hi: "जवाब दें" },
  rsvpBy: { en: "kindly reply by", hi: "कृपया जवाब दें" },
  when: { en: "when", hi: "कब" },
  where: { en: "where", hi: "कहाँ" },
  wear: { en: "wear", hi: "पहनावा" },
  maps: { en: "open in maps", hi: "नक्शे में खोलें" },
  calendar: { en: "add to calendar", hi: "कैलेंडर में जोड़ें" },
  close: { en: "close", hi: "बंद करें" },
  yourName: { en: "your name", hi: "आपका नाम" },
  coming: { en: "coming?", hi: "आ रहे हैं?" },
  yes: { en: "yes!", hi: "हाँ!" },
  no: { en: "sadly no", hi: "माफ़ कीजिए, नहीं" },
  howMany: { en: "how many of you", hi: "कितने लोग" },
  food: { en: "food", hi: "खाना" },
  veg: { en: "veg", hi: "शाकाहारी" },
  nonveg: { en: "non-veg", hi: "मांसाहारी" },
  jain: { en: "jain", hi: "जैन" },
  vegan: { en: "vegan", hi: "वीगन" },
  note: { en: "a note for the couple (optional)", hi: "जोड़े के लिए संदेश (वैकल्पिक)" },
  send: { en: "send it", hi: "भेजें" },
  sending: { en: "sending…", hi: "भेज रहे हैं…" },
  thanks: { en: "thank you! see you there.", hi: "धन्यवाद! वहीं मिलते हैं।" },
  thanksNo: { en: "we'll miss you. thank you for letting us know.", hi: "आपकी कमी खलेगी। बताने के लिए धन्यवाद।" },
  failed: { en: "couldn't send that. check your connection and try again.", hi: "भेजा नहीं जा सका। फिर से कोशिश करें।" },
  demo: { en: "demo mode: replies are only saved on this device", hi: "डेमो: जवाब सिर्फ़ इस डिवाइस पर सहेजे गए हैं" },
  edit: { en: "change my reply", hi: "जवाब बदलें" },
  closeLetter: { en: "fold it back up", hi: "वापस मोड़ें" },
} as const;

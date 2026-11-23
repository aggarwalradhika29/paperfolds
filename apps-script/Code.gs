// RSVP backend for the paperfolds wedding invite: a Google Sheet + this Apps Script.
// Setup (5 minutes) is in the README, under "Collect RSVPs in a Google Sheet".

const SHEET = "RSVPs";

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(["at", "name", "link", "events (json)", "food", "note"]);
  }
  return sh;
}

// Guests' replies arrive here.
function doPost(e) {
  const r = JSON.parse(e.postData.contents);
  const clip = (s, n) => String(s || "").slice(0, n);
  const events = {};
  Object.keys(r.events || {}).forEach((k) => (events[clip(k, 40)] = Math.max(0, Math.min(20, Number(r.events[k]) || 0))));
  sheet_().appendRow([new Date().toISOString(), clip(r.name, 120), clip(r.guestKey, 120), JSON.stringify(events), clip(r.food, 20), clip(r.note, 1000)]);
  return ContentService.createTextOutput("ok");
}

// The host page (?host=<HOST_KEY>) reads everything back from here.
function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty("HOST_KEY");
  const out = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  if (!key || e.parameter.key !== key) return out({ error: "wrong key" });
  const rows = sheet_().getDataRange().getValues().slice(1);
  return out({
    replies: rows.map((x) => ({ at: String(x[0]), name: x[1], guestKey: x[2], events: JSON.parse(x[3] || "{}"), food: x[4], note: x[5] })),
  });
}

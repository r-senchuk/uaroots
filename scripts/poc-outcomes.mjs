const ukrainianCities = new Set([
  "dolyna", "kalush", "ivano-frankivsk", "stryi", "halych", "burshtyn", "pustomyty",
  "lviv", "briukhovychi", "horodok-lviv", "mykolaiv-lviv", "novyi-rozdil", "nadvirna", "zhydachiv",
]);
const germanCities = new Set(["schwerin", "lueneburg", "luebeck", "celle", "wolfsburg", "braunschweig"]);
const rowFields = new Set([
  "code", "origin", "destination", "passengers", "source", "received", "contacted",
  "confirmed", "travelled", "reason", "test",
]);
const reasons = new Set(["unknown", "none", "date", "price", "pickup", "capacity", "cancelled", "no_show", "other"]);

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function countOrUnknown(value, maximum) {
  return value === null || (Number.isInteger(value) && value >= 0 && value <= maximum);
}

/** Validate private operator feedback and return only nonpersonal aggregates. */
export function summarizeOutcomes(input) {
  if (!object(input) || Object.keys(input).some((key) => key !== "period" && key !== "inquiries")) {
    throw new Error("Expected a period and inquiries array; unsupported fields are rejected.");
  }
  if (typeof input.period !== "string" || !/^20\d{2}-(0[1-9]|1[0-2])$/.test(input.period)) {
    throw new Error("Period must be YYYY-MM, not a passenger travel date.");
  }
  if (!Array.isArray(input.inquiries)) throw new Error("Expected an inquiries array.");
  const seen = new Set();
  const groups = new Map();
  let excludedTests = 0;

  for (const [index, row] of input.inquiries.entries()) {
    const fail = (message) => { throw new Error(`Record ${index + 1}: ${message}`); };
    if (!object(row) || Object.keys(row).some((key) => !rowFields.has(key))) {
      fail("unsupported fields; do not include passenger contact details, dates or free-text notes.");
    }
    if (typeof row.code !== "string" || !/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}$/.test(row.code)) {
      fail("a valid opaque inquiry code is required.");
    }
    if (seen.has(row.code)) fail("duplicate inquiry code; reconcile the record instead of counting it twice.");
    seen.add(row.code);
    const forward = ukrainianCities.has(row.origin) && germanCities.has(row.destination);
    const reverse = germanCities.has(row.origin) && ukrainianCities.has(row.destination);
    if (!forward && !reverse) fail("city pair is outside the six-city POC.");
    if (!Number.isInteger(row.passengers) || row.passengers < 1 || row.passengers > 8) fail("passengers must be 1–8.");
    if (!["uaroute", "koval", "unknown"].includes(row.source)) fail("source must be uaroute, koval or unknown.");
    if (![true, false, null].includes(row.received) || ![true, false, null].includes(row.contacted)) {
      fail("received/contacted must be true, false or null (unknown).");
    }
    if (!countOrUnknown(row.confirmed, row.passengers) || !countOrUnknown(row.travelled, row.passengers)) {
      fail("confirmed/travelled are passenger counts or null (unknown).");
    }
    if (row.confirmed !== null && row.travelled !== null && row.travelled > row.confirmed) {
      fail("travelled cannot exceed confirmed passengers.");
    }
    if ((row.contacted === true || (row.confirmed ?? 0) > 0 || (row.travelled ?? 0) > 0) && row.received !== true) {
      fail("a contacted/confirmed/travelled outcome needs operator-received evidence.");
    }
    if ((row.confirmed ?? 0) > 0 && row.contacted !== true) fail("manual confirmation needs contact evidence.");
    if ((row.travelled ?? 0) > 0 && row.confirmed === null) fail("a completed journey needs confirmed passenger evidence.");
    if (!reasons.has(row.reason)) fail("reason must be a bounded category, without free text.");
    if (typeof row.test !== "boolean") fail("test must explicitly distinguish synthetic records.");
    if (row.test) { excludedTests += 1; continue; }

    const key = `${row.origin}:${row.destination}:${row.source}`;
    const group = groups.get(key) ?? {
      origin: row.origin, destination: row.destination, source: row.source,
      direction: forward ? "to_germany" : "from_germany",
      inquiries: 0, received: 0, receivedUnknown: 0, contacted: 0, contactedUnknown: 0,
      requestedPassengers: 0, confirmedPassengers: 0, confirmationUnknown: 0,
      completedPassengerTrips: 0, travelledUnknown: 0, reasons: {},
    };
    group.inquiries += 1;
    group.requestedPassengers += row.passengers;
    if (row.received === true) group.received += 1;
    if (row.received === null) group.receivedUnknown += 1;
    if (row.contacted === true) group.contacted += 1;
    if (row.contacted === null) group.contactedUnknown += 1;
    if (row.confirmed === null) group.confirmationUnknown += 1;
    else group.confirmedPassengers += row.confirmed;
    if (row.travelled === null) group.travelledUnknown += 1;
    else group.completedPassengerTrips += row.travelled;
    group.reasons[row.reason] = (group.reasons[row.reason] ?? 0) + 1;
    groups.set(key, group);
  }

  const rows = [...groups.values()].sort((a, b) =>
    `${a.origin}:${a.destination}:${a.source}`.localeCompare(`${b.origin}:${b.destination}:${b.source}`),
  );
  return {
    period: input.period,
    completedPassengerTripsAttributedToUARoute: rows
      .filter((row) => row.source === "uaroute")
      .reduce((sum, row) => sum + row.completedPassengerTrips, 0),
    excludedTests,
    groups: rows,
    limitation: "Operator-reported outcomes; unknown is not zero. Attribution does not establish incremental demand.",
  };
}

import { describe, expect, it } from "vitest";
import { summarizeOutcomes } from "../../scripts/poc-outcomes.mjs";

const completed = {
  code: "UR-ABCDEFGH", origin: "dolyna", destination: "celle", passengers: 3,
  source: "uaroute", received: true, contacted: true, confirmed: 3, travelled: 2,
  reason: "no_show", test: false,
};

describe("operator outcome reconciliation", () => {
  it("counts actual passengers in both directions, excludes tests and separates other sources", () => {
    const result = summarizeOutcomes({ period: "2026-10", inquiries: [
      completed,
      { ...completed, code: "UR-JKLMNPQR", origin: "celle", destination: "dolyna", travelled: 1 },
      { ...completed, code: "UR-STUVWXYZ", source: "koval", travelled: 3 },
      { ...completed, code: "UR-23456789", test: true },
    ] });
    expect(result.completedPassengerTripsAttributedToUARoute).toBe(3);
    expect(result.excludedTests).toBe(1);
    expect(result.groups).toHaveLength(3);
    expect(JSON.stringify(result)).not.toContain(completed.code);
  });

  it("keeps unknown outcomes distinct from zero", () => {
    const result = summarizeOutcomes({ period: "2026-10", inquiries: [
      { ...completed, travelled: null, reason: "unknown" },
    ] });
    expect(result.groups[0]?.travelledUnknown).toBe(1);
    expect(result.completedPassengerTripsAttributedToUARoute).toBe(0);
  });

  it("rejects duplicates, impossible counts and unsupported city pairs", () => {
    expect(() => summarizeOutcomes({ period: "2026-10", inquiries: [completed, completed] })).toThrow(/duplicate/);
    expect(() => summarizeOutcomes({ period: "2026-10", inquiries: [{ ...completed, travelled: 4 }] })).toThrow(/counts/);
    expect(() => summarizeOutcomes({ period: "2026-10", inquiries: [{ ...completed, destination: "hamburg" }] })).toThrow(/outside/);
    expect(() => summarizeOutcomes({ period: "2026-10", inquiries: [{ ...completed, received: false }] })).toThrow(/evidence/);
  });

  it("rejects contact details, selected dates and free-text reasons without printing their contents", () => {
    for (const extra of [{ phone: "+380961234567" }, { name: "Synthetic traveller" }, { travelDate: "2026-11-01" }]) {
      expect(() => summarizeOutcomes({ period: "2026-10", inquiries: [{ ...completed, ...extra }] })).toThrow(/unsupported/);
    }
    expect(() => summarizeOutcomes({ period: "2026-10", inquiries: [{ ...completed, reason: "call +380961234567" }] })).toThrow(/bounded/);
    expect(() => summarizeOutcomes({ period: "2026-11-01", inquiries: [completed] })).toThrow(/YYYY-MM/);
  });
});

import { describe, expect, it } from "vitest";
import { createPrivacyChoice, parsePrivacyChoice, privacyChoiceLifetime } from "./privacy-choice";

describe("privacy choice validity", () => {
  const now = 1_800_000_000_000;
  it("remembers refusal and acceptance for the same bounded period", () => {
    for (const accepted of [true, false]) {
      const choice = createPrivacyChoice(accepted, now);
      expect(parsePrivacyChoice(JSON.stringify(choice), now)).toEqual(choice);
      expect(choice.advertising).toBe(false);
      expect(choice.expiresAt).toBe(now + privacyChoiceLifetime);
    }
  });
  it("requires a new choice at expiry, for a new notice, and for legacy consent", () => {
    const choice = createPrivacyChoice(true, now);
    expect(parsePrivacyChoice(JSON.stringify(choice), choice.expiresAt)).toBeNull();
    expect(parsePrivacyChoice(JSON.stringify({ ...choice, version: "old" }), now)).toBeNull();
    expect(parsePrivacyChoice("accepted", now)).toBeNull();
  });
  it("fails closed for malformed, future, advertising and extended-lifetime records", () => {
    const choice = createPrivacyChoice(true, now);
    for (const value of [null, "{", "null", JSON.stringify({ ...choice, chosenAt: now + 1 }), JSON.stringify({ ...choice, advertising: true }), JSON.stringify({ ...choice, expiresAt: choice.expiresAt + 1 }), JSON.stringify({ ...choice, analytics: "yes" })]) {
      expect(parsePrivacyChoice(value, now)).toBeNull();
    }
  });
});

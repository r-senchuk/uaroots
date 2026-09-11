import { describe, expect, it } from "vitest";

import { getResolvedRoute } from "@/data/queries";
import {
  buildInquiryMessage,
  buildInquiryTarget,
  createLeadId,
  formatTravelDate,
  validateInquiry,
} from "./whatsapp";

function sampleInput() {
  const route = getResolvedRoute("lviv-hannover");
  if (!route) throw new Error("missing sample route");
  return {
    route,
    travelDate: "2026-09-18",
    phone: "+38 096 123 45 67",
    passengers: 2,
  };
}

describe("validateInquiry", () => {
  it("requires a date and a plausible phone", () => {
    expect(validateInquiry({ travelDate: "", phone: "", passengers: 1 }).ok).toBe(false);
    expect(validateInquiry({ travelDate: "2026-09-18", phone: "123", passengers: 1 }).ok).toBe(
      false,
    );
    expect(
      validateInquiry({ travelDate: "2026-09-18", phone: "+380961234567", passengers: 2 }).ok,
    ).toBe(true);
  });
});

describe("buildInquiryMessage", () => {
  it("includes route, date, passengers, phone, source and lead code — not UTM", () => {
    const message = buildInquiryMessage(sampleInput(), "UR-8F3K");
    expect(message).toContain("Маршрут: Львів → Ганновер");
    expect(message).toContain("Дата: 18.09.2026");
    expect(message).toContain("Пасажирів: 2");
    expect(message).toContain("Телефон: +38 096 123 45 67");
    expect(message).toContain("Джерело: UARoute");
    expect(message).toContain("https://uaroute.com/routes/lviv-hannover");
    expect(message).toContain("Код: UR-8F3K");
    expect(message).not.toContain("utm_");
  });
});

describe("buildInquiryTarget", () => {
  it("opens WhatsApp to the Germany desk for Hannover", () => {
    const target = buildInquiryTarget(sampleInput(), "UR-TEST");
    expect(target.kind).toBe("whatsapp");
    if (target.kind !== "whatsapp") return;
    expect(target.desk.id).toBe("koval-de");
    expect(target.url).toMatch(/^https:\/\/wa\.me\/380509786330\?text=/);
  });
});

describe("helpers", () => {
  it("formats ISO dates as DD.MM.YYYY", () => {
    expect(formatTravelDate("2026-09-18")).toBe("18.09.2026");
  });

  it("creates an ephemeral UR-XXXX lead id", () => {
    expect(createLeadId()).toMatch(/^UR-[A-Z2-9]{4}$/);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getResolvedRoute } from "@/data/queries";
import { requireCity } from "@/data/cities";
import { withUtm } from "@/config/site";
import {
  buildCandidateInquiryMessage,
  buildCandidateInquiryTarget,
  buildInquiryMessage,
  buildInquiryTarget,
  createLeadId,
  formatTravelDate,
  localTodayISO,
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
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-11T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("requires a date and a plausible phone", () => {
    expect(validateInquiry({ travelDate: "", phone: "", passengers: 1 }).ok).toBe(false);
    expect(validateInquiry({ travelDate: "2026-09-18", phone: "123", passengers: 1 }).ok).toBe(
      false,
    );
    expect(
      validateInquiry({ travelDate: "2026-09-18", phone: "+380961234567", passengers: 2 }).ok,
    ).toBe(true);
    expect(
      validateInquiry({ travelDate: "2020-01-01", phone: "+380961234567", passengers: 1 }).ok,
    ).toBe(false);
    expect(
      validateInquiry({ travelDate: "2026-09-31", phone: "+380961234567", passengers: 1 }).ok,
    ).toBe(false);
    expect(
      validateInquiry({ travelDate: "2026-09-18", phone: "+3809612345671234", passengers: 1 }).ok,
    ).toBe(false);
    expect(
      validateInquiry({ travelDate: "2026-09-18", phone: "+380ABC1234567", passengers: 1 }).ok,
    ).toBe(false);
    expect(localTodayISO()).toBe("2026-09-11");
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
    expect(message).toContain("https://uaroute.com/routes/lviv-hannover/");
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

describe("candidate inquiry handoff", () => {
  const candidateInput = {
    origin: requireCity("lviv"),
    destination: requireCity("hannover"),
    deskId: "koval-de",
    sourcePath: "/routes/lviv-hannover/",
    travelDate: "2026-09-18",
    phone: "+38 096 123 45 67",
    passengers: 2,
  };

  it("says route feasibility must be confirmed and encodes the message for the verified desk", () => {
    const message = buildCandidateInquiryMessage(candidateInput, "UR-ABCDEFGHJK");
    expect(message).toContain("Маршрут: Львів → Ганновер");
    expect(message).toContain("Дата: 18.09.2026");
    expect(message).toContain("Телефон: +38 096 123 45 67");
    expect(message).toContain("підтвердьте можливість поїздки на цю дату");
    expect(message).toContain("Сторінка: https://uaroute.com/routes/lviv-hannover/");

    const target = buildCandidateInquiryTarget(candidateInput, "UR-ABCDEFGHJK");
    expect(target.kind).toBe("whatsapp");
    if (target.kind !== "whatsapp") return;
    expect(target.desk.id).toBe("koval-de");
    expect(decodeURIComponent(target.url.split("?text=")[1] ?? "")).toBe(message);
    expect(target.url).toMatch(/^https:\/\/wa\.me\/380509786330\?text=/);
  });

  it("preserves an approved city hub as the referral page and falls back from arbitrary paths", () => {
    const hubMessage = buildCandidateInquiryMessage(
      { ...candidateInput, sourcePath: "/cities/ivano-frankivsk/" },
      "UR-ABCDEFGHJK",
    );
    expect(hubMessage).toContain("Сторінка: https://uaroute.com/cities/ivano-frankivsk/");

    const unknownMessage = buildCandidateInquiryMessage(
      { ...candidateInput, sourcePath: "/cities/another-city/?phone=123" },
      "UR-ABCDEFGHJK",
    );
    expect(unknownMessage).toContain("Сторінка: https://uaroute.com/routes/");
    expect(unknownMessage).not.toContain("phone=123");
  });

  it("branches for a real candidate route and preserves code and city IDs on website fallback", () => {
    const route = getResolvedRoute("dolyna-celle");
    if (!route) throw new Error("missing candidate route");
    const inquiry = {
      route,
      travelDate: "2026-10-18",
      phone: "+38 096 123 45 67",
      passengers: 2,
    };

    const message = buildInquiryMessage(inquiry, "UR-ABCDEFGHJK");
    expect(message).toContain("Будь ласка, підтвердьте можливість поїздки на цю дату");
    expect(message).toContain("погодьте місця посадки й висадки");

    const direct = buildInquiryTarget(inquiry, "UR-ABCDEFGHJK");
    expect(direct.kind).toBe("whatsapp");
    if (direct.kind === "whatsapp") {
      expect(decodeURIComponent(direct.url.split("?text=")[1] ?? "")).toContain(
        "Будь ласка, підтвердьте можливість поїздки на цю дату",
      );
    }

    const fallback = buildInquiryTarget(
      { ...inquiry, route: { ...route, deskId: undefined } },
      "UR-ABCDEFGHJK",
    );
    expect(fallback.kind).toBe("website");
    if (fallback.kind !== "website") return;
    const url = new URL(fallback.url);
    expect(url.searchParams.get("ref_code")).toBe("UR-ABCDEFGHJK");
    expect(url.searchParams.get("origin_city_id")).toBe("dolyna");
    expect(url.searchParams.get("destination_city_id")).toBe("celle");
    expect(url.searchParams.has("travelDate")).toBe(false);
    expect(url.searchParams.has("phone")).toBe(false);
  });

  it("uses the Koval website with only opaque referral code and catalog city IDs for unknown desks", () => {
    const target = buildCandidateInquiryTarget(
      { ...candidateInput, deskId: "unverified-desk" },
      "UR-ABCDEFGHJK",
    );
    expect(target.kind).toBe("website");
    if (target.kind !== "website") return;
    const url = new URL(target.url);
    expect(url.searchParams.get("ref_code")).toBe("UR-ABCDEFGHJK");
    expect(url.searchParams.get("origin_city_id")).toBe("lviv");
    expect(url.searchParams.get("destination_city_id")).toBe("hannover");
    expect(url.searchParams.get("utm_campaign")).toBe("koval_poc");
    expect(url.searchParams.has("travelDate")).toBe(false);
    expect(url.searchParams.has("phone")).toBe(false);
  });
});

describe("helpers", () => {
  it("formats ISO dates as DD.MM.YYYY", () => {
    expect(formatTravelDate("2026-09-18")).toBe("18.09.2026");
  });

  it("creates an ephemeral UR-XXXX lead id", () => {
    expect(createLeadId()).toMatch(/^UR-[A-Z2-9]{10}$/);
  });

  it("accepts referral context only as opaque code and known city IDs", () => {
    const url = new URL(
      withUtm("https://www.4k-koval.com/?phone=%2B380501234567#private", "candidate_inquiry", {
        requestCode: "UR-ABCDEFGHJK",
        originCityId: "lviv",
        destinationCityId: "hannover",
      }),
    );
    expect(url.searchParams.get("ref_code")).toBe("UR-ABCDEFGHJK");
    expect(url.searchParams.get("origin_city_id")).toBe("lviv");
    expect(url.searchParams.get("destination_city_id")).toBe("hannover");
    expect(url.searchParams.has("phone")).toBe(false);
    expect(url.hash).toBe("");

    const unsafe = new URL(
      withUtm("https://www.4k-koval.com/", "Phone-380501234567", {
        requestCode: "Phone-380501234567",
        originCityId: "+380501234567",
        destinationCityId: "unknown-city",
      }),
    );
    expect(unsafe.searchParams.has("ref_code")).toBe(false);
    expect(unsafe.searchParams.has("origin_city_id")).toBe(false);
    expect(unsafe.searchParams.has("destination_city_id")).toBe(false);
    expect(unsafe.searchParams.get("utm_content")).toBe("partner_referral");
    expect(() => withUtm("https://example.com/", "footer")).toThrow();
    expect(() => withUtm("http://www.4k-koval.com/", "footer")).toThrow();
  });
});

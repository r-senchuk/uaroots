import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getResolvedRoute } from "@/data/queries";
import { requireCity } from "@/data/cities";
import { withUtm } from "@/config/site";
import {
  buildBicycleInquiryMessage,
  buildBicycleInquiryUrl,
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

  it("builds uncoded baseline bicycle inquiry message and URL", () => {
    const message = buildBicycleInquiryMessage();
    expect(message).toContain("перевезення велосипеда в мікроавтобусі");
    expect(message).toContain("Джерело: UARoute");
    expect(message).toContain("Сторінка: https://uaroute.com/guides/perevezennya-velosypeda/");
    expect(message).toContain("Це запит про поїздку, а не бронювання.");
    expect(message).not.toContain("Код:");
    expect(message).not.toContain("UR-");

    const url = buildBicycleInquiryUrl("380509786330");
    expect(url).toContain("https://wa.me/380509786330?text=");
    const decoded = decodeURIComponent(url);
    expect(decoded).not.toContain("Код:");
    expect(decoded).not.toContain("UR-INQUIRY");
  });

  it("builds coded bicycle inquiry message and URL when leadId is provided", () => {
    const leadId = "UR-ABCDEFGH23";
    const message = buildBicycleInquiryMessage(leadId);
    expect(message).toContain("перевезення велосипеда в мікроавтобусі");
    expect(message).toContain("Сторінка: https://uaroute.com/guides/perevezennya-velosypeda/");
    expect(message).toContain("Код: UR-ABCDEFGH23");

    const url = buildBicycleInquiryUrl("380509786330", leadId);
    expect(url).toContain("https://wa.me/380509786330?text=");
    expect(decodeURIComponent(url)).toContain("Код: UR-ABCDEFGH23");
  });

  it("renders BicycleInquiryCta baseline with uncoded href and no fabricated UR-INQUIRY", async () => {
    const { BicycleInquiryCta } = await import("@/components/BicycleInquiryCta");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const html = renderToStaticMarkup(BicycleInquiryCta({ whatsappNumber: "380509786330" }));

    expect(html).toContain('href="https://wa.me/380509786330?text=');
    expect(html).not.toContain("UR-INQUIRY");
    expect(decodeURIComponent(html)).not.toContain("Код:");
    expect(html).toContain('rel="noopener noreferrer nofollow"');
    expect(html).toContain('target="_blank"');
  });

  it("invokes BicycleInquiryCta handlers: attaches code on mousedown, reuses code on click, and restores baseline on failure", async () => {
    const { BicycleInquiryCta } = await import("@/components/BicycleInquiryCta");
    const { resetAttributionForTests } = await import("@/lib/analytics");

    class MockAnchor {
      href: string;
      dataset: Record<string, string> = {};
      attributes: Record<string, string> = {};
      constructor(initialHref: string) {
        this.href = initialHref;
        this.attributes.href = initialHref;
      }
      setAttribute(name: string, value: string) {
        this.attributes[name] = value;
        if (name === "href") this.href = value;
      }
      getAttribute(name: string) {
        return this.attributes[name];
      }
      removeAttribute(name: string) {
        delete this.attributes[name];
      }
    }

    const localEvents: unknown[] = [];
    const location = { origin: "https://uaroute.com", pathname: "/guides/perevezennya-velosypeda/", search: "" };
    vi.stubGlobal("window", {
      location,
      __uarouteEvents: localEvents,
      __uarouteAnalyticsConsent: true,
      __uarouteAnalyticsProviderReady: true,
    });

    const cta = BicycleInquiryCta({ whatsappNumber: "380509786330" });
    const baselineHref = cta.props.href;
    expect(baselineHref).toContain("https://wa.me/380509786330?text=");
    expect(decodeURIComponent(baselineHref)).not.toContain("Код:");

    // 1. Success sequence: onMouseDown attaches code, onClick reuses that exact code
    const mockAnchor = new MockAnchor(baselineHref);
    cta.props.onMouseDown({ currentTarget: mockAnchor as unknown as HTMLAnchorElement } as unknown as React.MouseEvent<HTMLAnchorElement>);
    const preparedCode = mockAnchor.dataset.leadId;
    expect(preparedCode).toMatch(/^UR-[A-Z2-9]{10}$/);
    expect(decodeURIComponent(mockAnchor.href)).toContain(`Код: ${preparedCode}`);

    // Click reuses the prepared code without generating a new one
    cta.props.onClick({ currentTarget: mockAnchor as unknown as HTMLAnchorElement } as unknown as React.MouseEvent<HTMLAnchorElement>);
    expect(mockAnchor.dataset.leadId).toBe(preparedCode);
    expect(decodeURIComponent(mockAnchor.href)).toContain(`Код: ${preparedCode}`);
    expect(localEvents.length).toBe(1);
    expect((localEvents[0] as Record<string, unknown>).leadId).toBe(preparedCode);

    // 2. Keyboard interaction (Enter/Space) also attaches code
    const keyboardAnchor = new MockAnchor(baselineHref);
    cta.props.onKeyDown({
      key: "Enter",
      currentTarget: keyboardAnchor as unknown as HTMLAnchorElement,
    } as unknown as React.KeyboardEvent<HTMLAnchorElement>);
    expect(keyboardAnchor.dataset.leadId).toMatch(/^UR-[A-Z2-9]{10}$/);

    // 3. Failure sequence: if code generation fails, catch block restores baseline href and removes leadId
    const failingAnchor = new MockAnchor(baselineHref);
    // Pre-populate with dirty/mismatched data to verify active cleanup on failure
    failingAnchor.href = "https://wa.me/380509786330?text=dirty";
    failingAnchor.setAttribute("href", "https://wa.me/380509786330?text=dirty");

    const entropyErrorSpy = vi.spyOn(crypto, "getRandomValues").mockImplementation(() => {
      throw new Error("Entropy error");
    });

    cta.props.onMouseDown({ currentTarget: failingAnchor as unknown as HTMLAnchorElement } as unknown as React.MouseEvent<HTMLAnchorElement>);
    expect(failingAnchor.href).toBe(baselineHref);
    expect(failingAnchor.dataset.leadId).toBeUndefined();
    expect(failingAnchor.getAttribute("data-lead-id")).toBeUndefined();
    expect(decodeURIComponent(failingAnchor.href)).not.toContain("Код:");

    // Click during failure tracks without leadId and keeps baseline intact
    cta.props.onClick({ currentTarget: failingAnchor as unknown as HTMLAnchorElement } as unknown as React.MouseEvent<HTMLAnchorElement>);
    expect(failingAnchor.href).toBe(baselineHref);
    expect(localEvents.length).toBe(2);
    expect((localEvents[1] as Record<string, unknown>).leadId).toBeUndefined();

    entropyErrorSpy.mockRestore();
    resetAttributionForTests();
    vi.unstubAllGlobals();
  });

  it("emits zero-PII and zero-leadId telemetry to enabled provider on bicycle CTA click", async () => {
    const { BicycleInquiryCta } = await import("@/components/BicycleInquiryCta");
    const { resetAttributionForTests } = await import("@/lib/analytics");

    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123456");
    vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "GTM-TEST123");

    class MockAnchor {
      href: string;
      dataset: Record<string, string> = {};
      attributes: Record<string, string> = {};
      constructor(initialHref: string) {
        this.href = initialHref;
        this.attributes.href = initialHref;
      }
      setAttribute(name: string, value: string) {
        this.attributes[name] = value;
        if (name === "href") this.href = value;
      }
      getAttribute(name: string) {
        return this.attributes[name];
      }
      removeAttribute(name: string) {
        delete this.attributes[name];
      }
    }

    const dataLayer: unknown[] = [];
    const localEvents: unknown[] = [];
    const location = { origin: "https://uaroute.com", pathname: "/guides/perevezennya-velosypeda/", search: "" };
    vi.stubGlobal("window", {
      location,
      dataLayer,
      __uarouteEvents: localEvents,
      __uarouteAnalyticsConsent: true,
      __uarouteAnalyticsProviderReady: true,
    });

    const cta = BicycleInquiryCta({ whatsappNumber: "380509786330" });
    const mockAnchor = new MockAnchor(cta.props.href);

    // Simulate mouse-down then click with enabled GTM provider
    cta.props.onMouseDown({ currentTarget: mockAnchor as unknown as HTMLAnchorElement } as unknown as React.MouseEvent<HTMLAnchorElement>);
    cta.props.onClick({ currentTarget: mockAnchor as unknown as HTMLAnchorElement } as unknown as React.MouseEvent<HTMLAnchorElement>);

    // Local QA buffer preserves leadId for reconciliation
    expect(localEvents).toHaveLength(1);
    const localEvent = localEvents[0] as Record<string, unknown>;
    expect(localEvent.leadId).toMatch(/^UR-[A-Z2-9]{10}$/);

    // GTM dataLayer envelope: leadId and PII are strictly stripped
    expect(dataLayer).toHaveLength(2);
    expect(dataLayer[0]).toEqual({ uaroute: null });
    const gtmPayload = dataLayer[1] as {
      event: string;
      uaroute: { event_name: string; parameters: Record<string, unknown> };
    };
    expect(gtmPayload.event).toBe("uaroute_analytics");
    expect(gtmPayload.uaroute.event_name).toBe("whatsapp_click");
    expect(gtmPayload.uaroute.parameters.ctaLocation).toBe("partner_card");
    expect(gtmPayload.uaroute.parameters.conversionType).toBe("whatsapp_inquiry");
    expect(gtmPayload.uaroute.parameters.targetPath).toBe("/guides/perevezennya-velosypeda/");
    expect(gtmPayload.uaroute.parameters).not.toHaveProperty("leadId");
    expect(gtmPayload.uaroute.parameters).not.toHaveProperty("phone");
    expect(gtmPayload.uaroute.parameters).not.toHaveProperty("travelDate");
    expect(gtmPayload.uaroute.parameters).not.toHaveProperty("name");

    const json = JSON.stringify(dataLayer);
    expect(json).not.toContain("UR-");
    expect(json).not.toContain("phone");
    expect(json).not.toContain("+380");
    expect(json).not.toContain("travelDate");

    // Also verify legacy direct GA (gtag) mode
    vi.stubEnv("NEXT_PUBLIC_GTM_CONTAINER_ID", "");
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      location,
      gtag,
      __uarouteEvents: [],
      __uarouteAnalyticsConsent: true,
      __uarouteAnalyticsProviderReady: true,
    });
    cta.props.onClick({ currentTarget: mockAnchor as unknown as HTMLAnchorElement } as unknown as React.MouseEvent<HTMLAnchorElement>);
    expect(gtag).toHaveBeenCalledOnce();
    const [gtagEvent, gtagName, gtagParams] = gtag.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(gtagEvent).toBe("event");
    expect(gtagName).toBe("whatsapp_click");
    expect(gtagParams).not.toHaveProperty("leadId");
    expect(gtagParams).not.toHaveProperty("phone");
    expect(gtagParams).not.toHaveProperty("travelDate");

    resetAttributionForTests();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
});

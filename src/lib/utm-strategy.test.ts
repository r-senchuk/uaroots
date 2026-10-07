import { afterEach, describe, expect, it, vi } from "vitest";
import { getReferralContract, withUtm } from "@/config/site";
import { parseAcquisitionTags } from "@/config/utm";
import { buildCampaignLink } from "./campaign-links";
import {
  captureAttribution,
  resetAttributionForTests,
  track,
} from "./analytics";

afterEach(() => {
  resetAttributionForTests();
  vi.unstubAllGlobals();
});

describe("UTM acquisition and partner separation", () => {
  it.each([
    "utm_source=facebook&utm_medium=organic",
    "utm_source=google&utm_medium=social",
    "utm_source=facebook",
    "utm_medium=social",
    "utm_source=facebook&utm_source=telegram&utm_medium=social",
    "utm_source=facebook&utm_medium=social&utm_medium=social",
    "utm_source=facebook&utm_medium=social&utm_campaign=m1&utm_campaign=route_launch",
    "utm_source=__proto__&utm_medium=social",
  ])("rejects incoherent or ambiguous channel tags: %s", (query) => {
    expect(parseAcquisitionTags(new URLSearchParams(query))).toBeUndefined();
  });

  it("falls back to the referrer as a complete pair, without leaking campaign text", () => {
    vi.stubGlobal("window", {
      location: {
        pathname: "/",
        search: "?utm_source=facebook&utm_medium=organic&utm_campaign=m1",
      },
    });
    vi.stubGlobal("document", {
      referrer: "https://www.bing.com/search?q=private",
    });
    expect(captureAttribution()).toEqual({
      source: "bing",
      medium: "organic",
      landingPage: "/",
    });
  });

  it("keeps bounded acquisition on events while partner URLs describe the new referral touch", () => {
    const location = {
      pathname: "/cities/lviv/",
      search:
        "?utm_source=telegram&utm_medium=social&utm_campaign=route_launch&utm_content=private&utm_term=private",
    };
    vi.stubGlobal("window", { location, __uarouteEvents: [] });
    captureAttribution();
    location.pathname = "/routes/lviv-celle/";
    location.search = "";
    const link = new URL(
      withUtm("https://www.4k-koval.com/", "lviv-celle_partner_card", {
        requestCode: "UR-ABCDEFGHJK",
        originCityId: "lviv",
        destinationCityId: "celle",
      }),
    );
    track("koval_site_click", {
      ctaLocation: "partner_card",
      targetPath: "/routes/lviv-celle/",
      leadId: "UR-ABCDEFGHJK",
    });
    expect(window.__uarouteEvents?.[0]).toMatchObject({
      source: "telegram",
      medium: "social",
      campaign: "route_launch",
      landingPage: "/cities/lviv/",
      targetPath: "/routes/lviv-celle/",
    });
    expect(JSON.stringify(window.__uarouteEvents)).not.toContain("private");
    expect(link.searchParams.get("utm_source")).toBe("uaroute");
    expect(link.searchParams.get("utm_campaign")).toBe("koval_poc");
    expect(link.searchParams.has("acquisition_source")).toBe(false);
    resetAttributionForTests();
    vi.stubGlobal("document", { referrer: "" });
    expect(captureAttribution()).toMatchObject({
      source: "direct",
      medium: "direct",
    });
  });

  it("drops an unapproved campaign without echoing it or losing a valid channel", () => {
    expect(
      parseAcquisitionTags(
        new URLSearchParams(
          "utm_source=telegram&utm_medium=social&utm_campaign=person@example.com",
        ),
      ),
    ).toEqual({ source: "telegram", medium: "social" });
  });

  it("builds clean external campaign links but rejects SEO, private query text and editorial targets", () => {
    expect(buildCampaignLink("/cities/lviv", "telegram", "route_launch")).toBe(
      "https://uaroute.com/cities/lviv/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch",
    );
    for (const args of [
      ["/routes/lviv-hamburg/", "facebook", "m1"],
      ["/cities/lviv/?phone=123", "facebook", "m1"],
      ["https://example.com/", "facebook", "m1"],
      ["/", "google", "m1"],
      ["/", "facebook", "koval_poc"],
    ])
      expect(() => buildCampaignLink(args[0], args[1], args[2])).toThrow();
  });

  it.each([
    { originCityId: "lviv" },
    { originCityId: "lviv", destinationCityId: "ivano-frankivsk" },
    { originCityId: "celle", destinationCityId: "wolfsburg" },
    { originCityId: "unknown", destinationCityId: "lviv" },
  ])("omits both endpoints for invalid city context: %j", (context) => {
    const url = new URL(
      withUtm("https://www.4k-koval.com/", "candidate_inquiry", context),
    );
    expect(url.searchParams.has("origin_city_id")).toBe(false);
    expect(url.searchParams.has("destination_city_id")).toBe(false);
  });

  it("exports the same receiver allowlist used by outbound links and preserves reverse direction", () => {
    const contract = getReferralContract();
    expect(contract.version).toBe(1);
    expect(contract.approvedContent).toContain("celle-lviv_partner_card");
    for (const content of contract.approvedContent) {
      expect(
        new URL(withUtm("https://www.4k-koval.com/", content)).searchParams.get(
          "utm_content",
        ),
      ).toBe(content);
    }
    const url = new URL(
      withUtm("https://www.4k-koval.com/", "celle-lviv_partner_card", {
        originCityId: "celle",
        destinationCityId: "lviv",
      }),
    );
    expect(url.searchParams.get("origin_city_id")).toBe("celle");
    expect(url.searchParams.get("destination_city_id")).toBe("lviv");
  });
});

import { describe, expect, it } from "vitest";

import { getCity } from "@/data/cities";
import { cityHubContents } from "@/data/city-hubs";
import { pilotUkrainianCityIds } from "@/data/discovery";
import { getCityHubPresentation } from "./city-hub-presentation";

describe("getCityHubPresentation", () => {
  it("sets Celle to a German departure with priority Ukrainian choices and only selected commercial cards", () => {
    const details = cityHubContents.find((content) => content.cityId === "celle")!;
    const presentation = getCityHubPresentation(getCity("celle")!, details.fromName, details.toName, details.routeSlugs)!;

    expect(presentation.initialOriginId).toBe("celle");
    expect(presentation.initialDirection).toBe("to-ukraine");
    expect(presentation.choiceCities.map((city) => city.id)).toEqual([
      "lviv", "ivano-frankivsk", ...pilotUkrainianCityIds.filter((id) => id !== "lviv" && id !== "ivano-frankivsk"),
    ]);
    expect(presentation.searchDescription).toContain("українське місто");
    expect(presentation.departureLabel).toBe("Як їхати із Целле");
    expect(presentation.departureHeading).toBe("Підготуйте виїзд із Целле");
    expect(presentation.arrivalHeading).toBe("Сплануйте прибуття до Целле");
    expect(presentation.routeCards.map((route) => route.slug)).toEqual(["celle-lviv", "lviv-celle", "celle-dolyna", "dolyna-celle"]);
    expect(presentation.choiceDirections.find((item) => item.city.id === "lviv")?.departureRoute?.slug).toBe("celle-lviv");
    expect(presentation.choiceDirections.find((item) => item.city.id === "lviv")?.returnRoute?.slug).toBe("lviv-celle");
    expect(presentation.choiceDirections.find((item) => item.city.id === "dolyna")?.departureRoute?.slug).toBe("celle-dolyna");
    expect(presentation.choiceDirections.find((item) => item.city.id === "dolyna")?.returnRoute?.slug).toBe("dolyna-celle");
    expect(presentation.relatedHubs.map(({ city }) => city.id)).toEqual(["lviv", "ivano-frankivsk"]);
  });

  it("keeps Ukrainian hubs outbound by default with six German choices", () => {
    const details = cityHubContents.find((content) => content.cityId === "lviv")!;
    const presentation = getCityHubPresentation(getCity("lviv")!, details.fromName, details.toName, details.routeSlugs)!;

    expect(presentation.initialOriginId).toBe("lviv");
    expect(presentation.initialDirection).toBe("to-germany");
    expect(presentation.choiceCities.map((city) => city.id)).toEqual(["schwerin", "lueneburg", "luebeck", "celle", "wolfsburg", "braunschweig"]);
    expect(presentation.departureLabel).toBe("Як їхати зі Львова");
    expect(presentation.arrivalHeading).toBe("Підготуйте повернення");
    expect(presentation.relatedHubs.map(({ city }) => city.id)).toEqual(["ivano-frankivsk", "celle"]);
  });

  it("does not present a city when country and country code are unsupported or inconsistent", () => {
    const celle = getCity("celle")!;
    const lviv = getCity("lviv")!;
    expect(getCityHubPresentation({ ...celle, country: "Австрія" }, "із Целле", "до Целле", [])).toBeUndefined();
    expect(getCityHubPresentation({ ...lviv, countryCode: "DE" }, "зі Львова", "до Львова", [])).toBeUndefined();
  });
});

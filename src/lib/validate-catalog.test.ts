import { describe, expect, it } from "vitest";

import { routes } from "@/data/routes";
import { validateCatalog } from "./validate-catalog";

describe("validateCatalog", () => {
  it("accepts the checked-in M1 dataset", () => {
    expect(validateCatalog()).toEqual([]);
  });
});


describe("FAQ shape and publication gates", () => {
  const route = routes.find((item) => item.serviceMode === "candidate_inquiry")!;
  const valid = { question: "Як уточнити поїздку?", answer: "Зверніться до перевізника." };
  function withFaq(faq: typeof route.faq, run: () => void) {
    const previous = route.faq;
    try { route.faq = faq; run(); } finally { route.faq = previous; }
  }
  for (const count of [0, 1, 3, 4]) {
    it(`accepts ${count} useful FAQ items without a count floor`, () => {
      withFaq(Array.from({ length: count }, (_, i) => ({ ...valid, question: `${valid.question} ${i}` })), () => expect(validateCatalog()).toEqual([]));
    });
  }
  it("rejects blank and malformed items", () => {
    for (const item of [{ ...valid, question: "  " }, { ...valid, answer: " " }, null, { question: 3, answer: "x" }]) {
      withFaq([item] as unknown as typeof route.faq, () => expect(validateCatalog()).toContain(`Route ${route.slug} has an invalid FAQ item`));
    }
    withFaq(null as unknown as typeof route.faq, () => expect(validateCatalog()).toContain(`Route ${route.slug} FAQ must be an array`));
  });
  it("rejects case/whitespace normalized duplicate questions within a page", () => {
    withFaq([valid, { ...valid, question: "  ЯК   УТОЧНИТИ ПОЇЗДКУ?  " }], () => expect(validateCatalog()).toContain(`Route ${route.slug} has a duplicate FAQ question`));
  });
  it("keeps the commercial missing-desk publication gate", () => {
    const previous = route.deskId;
    try {
      route.deskId = undefined;
      expect(validateCatalog()).toContain(`Commercial route ${route.slug} has no resolvable desk`);
    } finally { route.deskId = previous; }
  });
});

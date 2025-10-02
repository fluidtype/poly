import { GammaMarket, normalizeMarket } from "./helpers";

describe("normalizeMarket", () => {
  it("keeps markets with numeric ids", () => {
    const market = { id: 123, slug: "market-slug" } as GammaMarket;

    const normalized = normalizeMarket(market);

    expect(normalized).not.toBeNull();
    expect(normalized?.id).toBe("123");
    expect(normalized?.title).toBe("market-slug");
  });

  it("keeps markets that only expose _id", () => {
    const market = { _id: "abc123", title: "Only _id market" } as GammaMarket;

    const normalized = normalizeMarket(market);

    expect(normalized).not.toBeNull();
    expect(normalized?.id).toBe("abc123");
    expect(normalized?.title).toBe("Only _id market");
  });
});

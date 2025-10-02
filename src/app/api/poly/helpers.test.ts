import { GammaMarket, normalizeMarket } from "./helpers";

describe("normalizeMarket", () => {
  it("keeps markets with numeric ids", () => {
    const market = { id: 123, slug: "market-slug" } as GammaMarket;

    const normalized = normalizeMarket(market);

    expect(normalized).not.toBeNull();
    expect(normalized?.id).toBe("123");
    expect(normalized?.title).toBe("market-slug");
  });
});

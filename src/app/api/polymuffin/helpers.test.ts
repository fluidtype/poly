import { GammaMarket, normalizeMarket } from "./helpers";

describe("normalizeMarket", () => {
  it("keeps markets with numeric ids", () => {
    const market = { id: 123, slug: "market-slug" } as GammaMarket;

    const normalized = normalizeMarket(market);

    expect(normalized).not.toBeNull();
    expect(normalized?.id).toBe("123");
    expect(normalized?.title).toBe("market-slug");
    expect(normalized?.slug).toBe("market-slug");
  });

  it("keeps markets that only expose _id", () => {
    const market = { _id: "abc123", title: "Only _id market" } as GammaMarket;

    const normalized = normalizeMarket(market);

    expect(normalized).not.toBeNull();
    expect(normalized?.id).toBe("abc123");
    expect(normalized?.title).toBe("Only _id market");
  });

  it("extracts nested numeric metrics and preserves slug", () => {
    const market = {
      id: "nested-1",
      slug: "nested-market",
      title: "Nested metrics market",
      volume24h: { usd: "1234.56" },
      liquidity: { value: { usd: "7890.12" } },
    } as GammaMarket;

    const normalized = normalizeMarket(market);

    expect(normalized).not.toBeNull();
    expect(normalized?.slug).toBe("nested-market");
    expect(normalized?.volume24h).toBeCloseTo(1234.56);
    expect(normalized?.liquidity).toBeCloseTo(7890.12);
  });

  it("reads alternative numeric keys like volume24hUsd and liquidityInUsd", () => {
    const market = {
      id: "alt-keys",
      title: "Alt keys market",
      volume24hUsd: { amount: "321" },
      liquidityInUsd: "654.5",
    } as GammaMarket;

    const normalized = normalizeMarket(market);

    expect(normalized).not.toBeNull();
    expect(normalized?.volume24h).toBeCloseTo(321);
    expect(normalized?.liquidity).toBeCloseTo(654.5);
  });
});

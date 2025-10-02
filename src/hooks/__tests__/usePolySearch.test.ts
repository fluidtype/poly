import { normalizeMarket } from "../utils";

describe("normalizeMarket", () => {
  it("captures YES/NO prices", () => {
    const market = normalizeMarket({
      id: "1",
      title: "Test",
      endDate: null,
      volume24h: 0,
      liquidity: 0,
      status: "open",
      tokens: [
        { id: "yes", outcome: "YES", price: 0.6 },
        { id: "no", outcome: "NO", price: 0.4 },
      ],
    });

    expect(market.priceYes).toBe(0.6);
    expect(market.priceNo).toBe(0.4);
  });
});

import { fetchPolySearch } from "../usePolySearch";
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

describe("fetchPolySearch", () => {
  it("throws the message from a JSON error payload", async () => {
    const errorMessage = "Readable human error";

    const clonedResponse = {
      json: jest.fn().mockResolvedValue({ message: errorMessage }),
    };

    const mockResponse = {
      ok: false,
      status: 400,
      clone: jest.fn().mockReturnValue(clonedResponse),
      json: jest.fn(),
      text: jest.fn(),
    };

    const mockFetch = jest
      .fn()
      .mockResolvedValue(mockResponse as unknown as Response) as jest.MockedFunction<
      typeof fetch
    >;

    await expect(
      fetchPolySearch({}, mockFetch),
    ).rejects.toThrow(errorMessage);

    expect(mockFetch).toHaveBeenCalled();
    expect(mockResponse.text).not.toHaveBeenCalled();
    expect(clonedResponse.json).toHaveBeenCalled();
  });
});

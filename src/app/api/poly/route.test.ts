import { GET } from "./route";
import { fetchWithTimeout } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  fetchWithTimeout: jest.fn(),
}));

const mockedFetchWithTimeout = fetchWithTimeout as jest.MockedFunction<typeof fetchWithTimeout>;

describe("GET /api/poly", () => {
  const originalEnv = process.env.POLY_GAMMA_BASE;

  beforeEach(() => {
    mockedFetchWithTimeout.mockReset();
    process.env.POLY_GAMMA_BASE = "https://gamma.example";
  });

  afterAll(() => {
    process.env.POLY_GAMMA_BASE = originalEnv;
  });

  it("returns markets when nested under data.markets", async () => {
    const payload = {
      data: {
        markets: [
          {
            _id: "abc123",
            question: "Nested market",
            volume24h: "0",
            liquidity: "0",
          },
        ],
      },
    };

    mockedFetchWithTimeout.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const request = new Request("https://local.test/api/poly?limit=5");
    const response = await GET(request);

    expect(mockedFetchWithTimeout).toHaveBeenCalledWith(
      "https://gamma.example/markets?active=true&limit=5",
    );

    const body = await response.json();

    expect(body.status).toBe("success");
    expect(body.count).toBe(1);
    expect(body.markets).toHaveLength(1);
    expect(body.markets[0].id).toBe("abc123");
    expect(body.markets[0].title).toBe("Nested market");
  });
});

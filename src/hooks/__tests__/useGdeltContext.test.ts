import { fetchGdeltContextData } from "../useGdeltContext";
import { normalizeGdeltDate } from "../utils";

describe("useGdeltContext utilities", () => {
  it("normalizes YYYYMMDD dates to ISO format", () => {
    expect(normalizeGdeltDate("20250831")).toBe("2025-08-31");
  });

  it("propagates 365 day guard errors", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ status: "error", message: "Daily queries limited to 365 days" }),
      text: async () => "",
    });

    await expect(
      fetchGdeltContextData(
        { keywords: ["test"], dateStart: "20240101", dateEnd: "20241231", limit: 500, includeInsights: true },
        fetchMock,
      ),
    ).rejects.toThrow("Daily queries limited to 365 days");
  });
});

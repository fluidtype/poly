import { fetchGdeltCountry } from "../useGdeltCountry";

describe("useGdeltCountry", () => {
  it("logs service unavailability", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "",
    });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      fetchGdeltCountry({ country: "US", dateStart: "20240101", dateEnd: "20240131" }, fetchMock),
    ).rejects.toThrow("Service unavailable");

    expect(consoleSpy).toHaveBeenCalledWith("Service unavailable");

    consoleSpy.mockRestore();
  });
});

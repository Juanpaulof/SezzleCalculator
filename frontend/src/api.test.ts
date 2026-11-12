import { ApiError, calculate } from "./api";

function mockFetch(impl: () => Promise<unknown>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

afterEach(() => vi.unstubAllGlobals());

describe("calculate", () => {
  it("posts the request and returns the parsed body", async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({ operation: "ADD", result: "5" }) }));

    const result = await calculate({ operation: "ADD", a: 2, b: 3 });

    expect(result).toEqual({ operation: "ADD", result: "5" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/calculate",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ operation: "ADD", a: 2, b: 3 }) }),
    );
  });

  it("surfaces the backend error message", async () => {
    mockFetch(async () => ({ ok: false, status: 400, json: async () => ({ message: "Cannot divide by zero" }) }));
    await expect(calculate({ operation: "DIVIDE", a: 1, b: 0 })).rejects.toThrow("Cannot divide by zero");
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    mockFetch(async () => ({ ok: false, status: 502, json: async () => { throw new Error("not json"); } }));
    await expect(calculate({ operation: "ADD", a: 1, b: 1 })).rejects.toThrow("HTTP 502");
  });

  it("throws an ApiError when the network fails", async () => {
    mockFetch(async () => { throw new TypeError("Failed to fetch"); });
    await expect(calculate({ operation: "ADD", a: 1, b: 1 })).rejects.toBeInstanceOf(ApiError);
  });
});

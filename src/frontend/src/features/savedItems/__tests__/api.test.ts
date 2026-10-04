import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchSavedItems,
  saveProduct,
  SavedItemLimitError,
  unsaveProduct,
} from "../api";

const savedItem = {
  id: "dev-user:prod-001",
  userId: "dev-user",
  productId: "prod-001",
  savedAt: "2026-01-01T10:00:00+00:00",
};

function mockFetch(status: number, body?: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("saveProduct", () => {
  it("posts to the save endpoint as the current user", async () => {
    const fetchMock = mockFetch(201, savedItem);

    const result = await saveProduct("prod-001");

    expect(result).toEqual(savedItem);
    expect(fetchMock).toHaveBeenCalledWith("/api/products/prod-001/save", {
      method: "POST",
      headers: { "X-User-Id": "dev-user" },
    });
  });

  it("throws SavedItemLimitError when the cap is hit", async () => {
    mockFetch(409);

    await expect(saveProduct("prod-001")).rejects.toBeInstanceOf(
      SavedItemLimitError,
    );
  });

  it("throws on any other failure", async () => {
    mockFetch(500);

    await expect(saveProduct("prod-001")).rejects.toThrow(
      "Failed to save product: 500",
    );
  });
});

describe("unsaveProduct", () => {
  it("deletes the save endpoint as the current user", async () => {
    const fetchMock = mockFetch(204);

    await unsaveProduct("prod-001");

    expect(fetchMock).toHaveBeenCalledWith("/api/products/prod-001/save", {
      method: "DELETE",
      headers: { "X-User-Id": "dev-user" },
    });
  });

  it("throws on failure", async () => {
    mockFetch(401);

    await expect(unsaveProduct("prod-001")).rejects.toThrow(
      "Failed to unsave product: 401",
    );
  });
});

describe("fetchSavedItems", () => {
  it("gets the saved items as the current user", async () => {
    const fetchMock = mockFetch(200, [savedItem]);

    const items = await fetchSavedItems();

    expect(items).toEqual([savedItem]);
    expect(fetchMock).toHaveBeenCalledWith("/api/saved-items", {
      headers: { "X-User-Id": "dev-user" },
    });
  });

  it("throws on failure", async () => {
    mockFetch(500);

    await expect(fetchSavedItems()).rejects.toThrow(
      "Failed to fetch saved items: 500",
    );
  });
});

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stubFetch } from "../../../testUtils";
import { SavedItemList } from "../SavedItemList";

const products = [
  {
    id: "prod-001",
    name: "Trail Running Shoes",
    category: "Footwear",
    price: 129.99,
    description: "Lightweight shoes built for uneven terrain.",
  },
  {
    id: "prod-002",
    name: "Insulated Water Bottle",
    category: "Accessories",
    price: 24.5,
    description: "Keeps drinks cold for 24 hours.",
  },
];

// The API answers newest first; these two are deliberately in that order.
const savedItems = [
  {
    id: "dev-user:prod-002",
    userId: "dev-user",
    productId: "prod-002",
    savedAt: "2026-01-02T10:00:00+00:00",
  },
  {
    id: "dev-user:prod-001",
    userId: "dev-user",
    productId: "prod-001",
    savedAt: "2026-01-01T10:00:00+00:00",
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SavedItemList", () => {
  it("lists the saved products in the order the API returns them", async () => {
    stubFetch({
      "GET /api/saved-items": { body: savedItems },
      "GET /api/products": { body: products },
    });

    render(<SavedItemList />);

    const rows = await screen.findAllByTestId("saved-row");

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Insulated Water Bottle");
    expect(rows[0]).toHaveTextContent("$24.50");
    expect(rows[1]).toHaveTextContent("Trail Running Shoes");
  });

  it("shows an empty state when nothing is saved", async () => {
    stubFetch({
      "GET /api/saved-items": { body: [] },
      "GET /api/products": { body: products },
    });

    render(<SavedItemList />);

    expect(
      await screen.findByText(/haven't saved any products/i),
    ).toBeInTheDocument();
  });

  it("removes a row when the product is unsaved", async () => {
    const fetchMock = stubFetch({
      "GET /api/saved-items": { body: savedItems },
      "GET /api/products": { body: products },
      "DELETE /api/products/prod-002/save": { status: 204 },
    });

    render(<SavedItemList />);

    const rows = await screen.findAllByTestId("saved-row");
    await act(async () => {
      fireEvent.click(within(rows[0]).getByRole("button", { name: "Unsave" }));
    });

    expect(await screen.findAllByTestId("saved-row")).toHaveLength(1);
    expect(screen.getByText("Trail Running Shoes")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/products/prod-002/save", {
      method: "DELETE",
      headers: { "X-User-Id": "dev-user" },
    });
  });

  it("keeps the row and explains when un-saving fails", async () => {
    stubFetch({
      "GET /api/saved-items": { body: savedItems },
      "GET /api/products": { body: products },
      "DELETE /api/products/prod-002/save": { status: 500 },
    });

    render(<SavedItemList />);

    const rows = await screen.findAllByTestId("saved-row");
    await act(async () => {
      fireEvent.click(within(rows[0]).getByRole("button", { name: "Unsave" }));
    });

    expect(screen.getAllByTestId("saved-row")).toHaveLength(2);
    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't remove that product/i,
    );
  });

  it("falls back to the product id when the product lookup fails", async () => {
    stubFetch({
      "GET /api/saved-items": { body: [savedItems[0]] },
      "GET /api/products": { status: 500 },
    });

    render(<SavedItemList />);

    expect(await screen.findByTestId("saved-row")).toHaveTextContent(
      "prod-002",
    );
  });

  it("shows an error state when the saved items can't be loaded", async () => {
    stubFetch({
      "GET /api/saved-items": { status: 500 },
      "GET /api/products": { body: products },
    });

    render(<SavedItemList />);

    expect(
      await screen.findByText(/couldn't load your saved items/i),
    ).toBeInTheDocument();
  });
});

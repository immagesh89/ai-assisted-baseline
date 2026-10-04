import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductList } from "../ProductList";

const sampleProduct = {
  id: "prod-001",
  name: "Trail Running Shoes",
  category: "Footwear",
  price: 129.99,
  description: "Lightweight shoes built for uneven terrain.",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProductList", () => {
  it("shows a loading state before the fetch resolves", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));

    render(<ProductList />);

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it("renders a card per product once loaded", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [sampleProduct],
    } as Response);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Trail Running Shoes")).toBeInTheDocument();
    });
    expect(screen.getAllByTestId("product-card")).toHaveLength(1);
  });

  it("shows an empty state when there are no products", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
    });
  });

  it("shows an error state when the request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText(/couldn't load products/i)).toBeInTheDocument();
    });
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { stubFetch } from "../testUtils";

afterEach(() => {
  vi.restoreAllMocks();
  window.history.pushState({}, "", "/");
});

describe("App", () => {
  it("shows the catalog at / and the saved list at /saved", async () => {
    stubFetch({
      "GET /api/products": {
        body: [
          {
            id: "prod-001",
            name: "Trail Running Shoes",
            category: "Footwear",
            price: 129.99,
            description: "Lightweight shoes built for uneven terrain.",
          },
        ],
      },
      "GET /api/saved-items": {
        body: [
          {
            id: "dev-user:prod-001",
            userId: "dev-user",
            productId: "prod-001",
            savedAt: "2026-01-01T10:00:00+00:00",
          },
        ],
      },
    });

    render(<App />);

    expect(await screen.findByText("Trail Running Shoes")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");

    await act(async () => {
      fireEvent.click(screen.getByRole("link", { name: "Saved" }));
    });

    expect(await screen.findByTestId("saved-row")).toHaveTextContent(
      "Trail Running Shoes",
    );
    expect(window.location.pathname).toBe("/saved");
  });

  it("loads the saved items once for the whole page", async () => {
    const fetchMock = stubFetch({
      "GET /api/products": { body: [] },
      "GET /api/saved-items": { body: [] },
    });

    render(<App />);

    await screen.findByText(/no products found/i);

    const savedItemCalls = fetchMock.mock.calls.filter(
      ([input]) => String(input) === "/api/saved-items",
    );

    expect(savedItemCalls).toHaveLength(1);
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stubFetch } from "../../../testUtils";
import { SaveButton } from "../SaveButton";

const productId = "prod-001";

const savedItem = {
  id: "dev-user:prod-001",
  userId: "dev-user",
  productId,
  savedAt: "2026-01-01T10:00:00+00:00",
};

afterEach(() => {
  vi.restoreAllMocks();
});

// Clicking a control that kicks off an async save: wrap it so the optimistic
// update and the follow-up state update both settle before the assertions.
async function click(element: HTMLElement) {
  await act(async () => {
    fireEvent.click(element);
  });
}

describe("SaveButton", () => {
  it("starts unsaved and shows the saved state once the save succeeds", async () => {
    stubFetch({
      "GET /api/saved-items": { body: [] },
      [`POST /api/products/${productId}/save`]: {
        status: 201,
        body: savedItem,
      },
    });

    render(<SaveButton productId={productId} />);

    await click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("button", { name: "Saved" }),
    ).toBeInTheDocument();
  });

  it("shows the saved state for a product that is already saved", async () => {
    stubFetch({ "GET /api/saved-items": { body: [savedItem] } });

    render(<SaveButton productId={productId} />);

    expect(
      await screen.findByRole("button", { name: "Saved" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("unsaves an already saved product", async () => {
    stubFetch({
      "GET /api/saved-items": { body: [savedItem] },
      [`DELETE /api/products/${productId}/save`]: { status: 204 },
    });

    render(<SaveButton productId={productId} />);

    await click(await screen.findByRole("button", { name: "Saved" }));

    expect(await screen.findByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reverts the toggle and explains when the save fails", async () => {
    stubFetch({
      "GET /api/saved-items": { body: [] },
      [`POST /api/products/${productId}/save`]: { status: 500 },
    });

    render(<SaveButton productId={productId} />);

    await click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("button", { name: "Save" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't update your saved items/i,
    );
  });

  it("reverts the toggle when un-saving fails", async () => {
    stubFetch({
      "GET /api/saved-items": { body: [savedItem] },
      [`DELETE /api/products/${productId}/save`]: { status: 500 },
    });

    render(<SaveButton productId={productId} />);

    await click(await screen.findByRole("button", { name: "Saved" }));

    expect(
      await screen.findByRole("button", { name: "Saved" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't update your saved items/i,
    );
  });

  it("shows a message instead of failing silently when the cap is hit", async () => {
    stubFetch({
      "GET /api/saved-items": { body: [] },
      [`POST /api/products/${productId}/save`]: { status: 409 },
    });

    render(<SaveButton productId={productId} />);

    await click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /limit of saved products/i,
    );
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

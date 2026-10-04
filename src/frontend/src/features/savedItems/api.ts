import { authHeaders } from "./auth";
import type { SavedItem } from "./types";

// Same shape as features/products/api.ts: one thin async function per endpoint,
// throwing on non-OK so callers handle the failure. SavedItemLimitError is the
// one addition — the UI has to tell the 20-item cap apart from other failures to
// show a message that isn't a silent failure.
export class SavedItemLimitError extends Error {
  constructor() {
    super(
      "You've reached the limit of saved products. Un-save one to save another.",
    );
    this.name = "SavedItemLimitError";
  }
}

export async function saveProduct(productId: string): Promise<SavedItem> {
  const response = await fetch(`/api/products/${productId}/save`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (response.status === 409) {
    throw new SavedItemLimitError();
  }

  if (!response.ok) {
    throw new Error(`Failed to save product: ${response.status}`);
  }

  return response.json();
}

export async function unsaveProduct(productId: string): Promise<void> {
  const response = await fetch(`/api/products/${productId}/save`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to unsave product: ${response.status}`);
  }
}

export async function fetchSavedItems(): Promise<SavedItem[]> {
  const response = await fetch("/api/saved-items", { headers: authHeaders() });

  if (!response.ok) {
    throw new Error(`Failed to fetch saved items: ${response.status}`);
  }

  return response.json();
}

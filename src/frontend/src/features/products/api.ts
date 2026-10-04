import type { Product } from "./types";

// Convention for this repo: one small async function per endpoint, thin
// wrapper over fetch, throws on non-OK so callers can catch/handle. Mirror
// this shape for the new save/unsave/saved-items calls rather than
// introducing a different pattern (axios, a generic client class, etc.).
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  return response.json();
}

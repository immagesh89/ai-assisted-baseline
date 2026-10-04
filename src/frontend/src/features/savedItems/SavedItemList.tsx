import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../products/api";
import type { Product } from "../products/types";
import { useSavedItems } from "./useSavedItems";

// The saved-items API stores product ids only, so the product details come from
// the catalog endpoint and are matched up here.
export function SavedItemList() {
  const { items, status, toggle } = useSavedItems();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Rows fall back to the product id, so a failed lookup isn't fatal here.
        if (!cancelled) {
          setProducts([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  async function handleUnsave(productId: string) {
    setError(null);

    try {
      await toggle(productId);
    } catch {
      setError("Couldn't remove that product from your saved items.");
    }
  }

  if (status === "loading") {
    return <p className="status-message">Loading saved items…</p>;
  }

  if (status === "error") {
    return (
      <p className="status-message">
        Couldn't load your saved items. Is the API running on localhost:5080?
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="status-message">
        You haven't saved any products yet. Save one from the catalog to see it
        here.
      </p>
    );
  }

  return (
    <div>
      {error !== null && (
        <p className="save-error" role="alert">
          {error}
        </p>
      )}
      <ul className="saved-list">
        {items.map((item) => {
          const product = productsById.get(item.productId);

          return (
            <li key={item.id} className="saved-row" data-testid="saved-row">
              <div>
                <h3>{product?.name ?? item.productId}</h3>
                <p className="saved-at">
                  Saved {new Date(item.savedAt).toLocaleString()}
                </p>
              </div>
              {product !== undefined && (
                <p className="price">${product.price.toFixed(2)}</p>
              )}
              <button
                type="button"
                className="unsave-button"
                onClick={() => handleUnsave(item.productId)}
              >
                Unsave
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

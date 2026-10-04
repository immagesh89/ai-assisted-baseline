import { useEffect, useState } from "react";
import { fetchProducts } from "./api";
import { ProductCard } from "./ProductCard";
import type { Product } from "./types";

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <p className="status-message">Loading products…</p>;
  }

  if (status === "error") {
    return (
      <p className="status-message">
        Couldn't load products. Is the API running on localhost:5080?
      </p>
    );
  }

  if (products.length === 0) {
    return <p className="status-message">No products found.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchSavedItems, saveProduct, unsaveProduct } from "./api";
import { CURRENT_USER_ID } from "./auth";
import { SavedItemsContext } from "./SavedItemsContext";
import type { SavedItem, SavedItemsState, SavedItemsStatus } from "./types";

// Saved items are shared state: a card on the catalog page and a row on the saved
// page have to agree, and the API shouldn't be asked once per card. App mounts a
// SavedItemsProvider so every component reads and writes the same list.
export function useSavedItems(): SavedItemsState {
  const shared = useContext(SavedItemsContext);

  // Rendered without a provider — a component mounted on its own, or in a unit
  // test — fall back to component-local state instead of failing.
  const own = useSavedItemsState(shared === null);

  return shared ?? own;
}

export function useSavedItemsState(fetchOnMount: boolean): SavedItemsState {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [status, setStatus] = useState<SavedItemsStatus>(
    fetchOnMount ? "loading" : "ready",
  );
  const toggledRef = useRef(false);

  useEffect(() => {
    if (!fetchOnMount) {
      return;
    }

    let cancelled = false;

    fetchSavedItems()
      .then((data) => {
        if (cancelled) {
          return;
        }

        // A save or un-save that landed while this request was in flight is
        // newer than the response, so the response must not overwrite it.
        if (!toggledRef.current) {
          setItems(toSavedItems(data));
        }

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchOnMount]);

  const isSaved = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items],
  );

  // Toggles optimistically: the UI reflects the change straight away, the
  // previous list comes back if the API refuses, and the error is re-thrown so
  // the caller can explain what happened.
  const toggle = useCallback(
    async (productId: string) => {
      const saved = items.some((item) => item.productId === productId);

      toggledRef.current = true;

      setItems(
        saved
          ? items.filter((item) => item.productId !== productId)
          : [optimisticItem(productId), ...items],
      );

      try {
        if (saved) {
          await unsaveProduct(productId);
        } else {
          await saveProduct(productId);
        }
      } catch (error) {
        setItems(items);
        throw error;
      }
    },
    [items],
  );

  return { items, status, isSaved, toggle };
}

// The API owns the real id and savedAt; until the list is reloaded the optimistic
// copy carries a local stand-in so ids stay unique and ordering still works.
function optimisticItem(productId: string): SavedItem {
  return {
    id: `optimistic:${productId}`,
    userId: CURRENT_USER_ID,
    productId,
    savedAt: new Date().toISOString(),
  };
}

function toSavedItems(data: unknown): SavedItem[] {
  return Array.isArray(data)
    ? data.filter(
        (item): item is SavedItem =>
          typeof item?.productId === "string" &&
          typeof item.savedAt === "string",
      )
    : [];
}

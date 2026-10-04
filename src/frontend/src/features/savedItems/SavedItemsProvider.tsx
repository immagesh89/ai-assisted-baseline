import type { ReactNode } from "react";
import { SavedItemsContext } from "./SavedItemsContext";
import { useSavedItemsState } from "./useSavedItems";

interface SavedItemsProviderProps {
  children: ReactNode;
}

export function SavedItemsProvider({ children }: SavedItemsProviderProps) {
  const savedItems = useSavedItemsState(true);

  return (
    <SavedItemsContext.Provider value={savedItems}>
      {children}
    </SavedItemsContext.Provider>
  );
}

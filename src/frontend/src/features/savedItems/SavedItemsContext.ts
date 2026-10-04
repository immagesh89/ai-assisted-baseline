import { createContext } from "react";
import type { SavedItemsState } from "./types";

// null means "no provider above me" — see useSavedItems.
export const SavedItemsContext = createContext<SavedItemsState | null>(null);

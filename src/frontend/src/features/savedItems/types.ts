export interface SavedItem {
  id: string;
  userId: string;
  productId: string;
  savedAt: string;
}

export type SavedItemsStatus = "loading" | "ready" | "error";

export interface SavedItemsState {
  items: SavedItem[];
  status: SavedItemsStatus;
  isSaved: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
}

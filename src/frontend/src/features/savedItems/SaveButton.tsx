import { useState } from "react";
import { SavedItemLimitError } from "./api";
import { useSavedItems } from "./useSavedItems";

interface SaveButtonProps {
  productId: string;
}

export function SaveButton({ productId }: SaveButtonProps) {
  const { isSaved, toggle } = useSavedItems();
  const [error, setError] = useState<string | null>(null);

  const saved = isSaved(productId);

  async function handleClick() {
    setError(null);

    try {
      await toggle(productId);
    } catch (caught) {
      // The state has already been rolled back by toggle; explain why it didn't stick.
      setError(
        caught instanceof SavedItemLimitError
          ? caught.message
          : "Couldn't update your saved items. Please try again.",
      );
    }
  }

  return (
    <div className="save">
      <button
        type="button"
        className="save-button"
        aria-pressed={saved}
        onClick={handleClick}
      >
        {saved ? "Saved" : "Save"}
      </button>
      {error !== null && (
        <p className="save-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

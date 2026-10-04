namespace Api.Features.SavedItems;

// Save is idempotent, so it reports which of the three outcomes happened rather
// than just succeeding or throwing: Item is the stored document for Created and
// AlreadySaved, and null when LimitReached means nothing was written.
public record SavedItemSaveResult(SaveStatus Status, SavedItem? Item);
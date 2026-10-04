namespace Api.Features.SavedItems;

// Document shape for a saved item: { id, userId, productId, savedAt }. The
// field order matches what a Cosmos DB document would look like, so a real
// implementation can persist this type as-is.
public record SavedItem(string Id, string UserId, string ProductId, DateTimeOffset SavedAt);
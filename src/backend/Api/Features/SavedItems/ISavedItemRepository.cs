namespace Api.Features.SavedItems;

public interface ISavedItemRepository
{
    // A user may hold at most this many saved items; saving beyond it reports
    // SaveStatus.LimitReached instead of silently dropping the request.
    const int MaxItemsPerUser = 20;

    // Every method is scoped to a single user, matching the partition key a
    // CosmosSavedItemRepository would query on.
    IReadOnlyList<SavedItem> GetByUser(string userId);

    SavedItemSaveResult Save(string userId, string productId);

    bool Remove(string userId, string productId);
}
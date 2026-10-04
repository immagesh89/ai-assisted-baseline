namespace Api.Features.SavedItems;

// In-memory implementation for local development — no Azure access required.
// Keyed by userId, the partition key a CosmosSavedItemRepository would use,
// with each user's documents held together the way a single partition query
// would return them. A real implementation can be swapped in via dependency
// injection without changing this interface or any endpoint.
public class InMemorySavedItemRepository : ISavedItemRepository
{
    private const string IdSeparator = ":";

    // userId (partition key) -> that partition's documents, oldest first.
    private readonly Dictionary<string, List<SavedItem>> _itemsByUser = new(StringComparer.Ordinal);
    private readonly object _gate = new();

    public IReadOnlyList<SavedItem> GetByUser(string userId)
    {
        lock (_gate)
        {
            return _itemsByUser.TryGetValue(userId, out var items)
                ? items.OrderByDescending(item => item.SavedAt).ToList()
                : [];
        }
    }

    public SavedItemSaveResult Save(string userId, string productId)
    {
        lock (_gate)
        {
            var items = GetPartition(userId);

            var existing = items.FirstOrDefault(item => item.ProductId == productId);
            if (existing is not null)
            {
                return new SavedItemSaveResult(SaveStatus.AlreadySaved, existing);
            }

            if (items.Count >= ISavedItemRepository.MaxItemsPerUser)
            {
                return new SavedItemSaveResult(SaveStatus.LimitReached, null);
            }

            var item = new SavedItem(
                $"{userId}{IdSeparator}{productId}",
                userId,
                productId,
                NextSavedAt(items));
            items.Add(item);

            return new SavedItemSaveResult(SaveStatus.Created, item);
        }
    }

    public bool Remove(string userId, string productId)
    {
        lock (_gate)
        {
            if (!_itemsByUser.TryGetValue(userId, out var items))
            {
                return false;
            }

            var removed = items.RemoveAll(item => item.ProductId == productId) > 0;

            if (items.Count == 0)
            {
                _itemsByUser.Remove(userId);
            }

            return removed;
        }
    }

    private List<SavedItem> GetPartition(string userId)
    {
        if (!_itemsByUser.TryGetValue(userId, out var items))
        {
            items = [];
            _itemsByUser[userId] = items;
        }

        return items;
    }

    // Two saves can land on the same clock tick, which would leave "most recently
    // saved first" ambiguous. Nudging a repeat forward keeps the sort exact
    // without adding a field to the stored document.
    private static DateTimeOffset NextSavedAt(List<SavedItem> items)
    {
        var now = DateTimeOffset.UtcNow;
        var latest = items.Count > 0 ? items[^1].SavedAt : DateTimeOffset.MinValue;

        return now > latest ? now : latest.AddTicks(1);
    }
}
namespace Api.Features.Products;

// In-memory implementation for local development and Day 1 training — no Azure
// access required. Deliberately keyed and shaped to mirror what a Cosmos DB
// partition-key pattern will look like (see REQUIREMENTS.md's note on
// ISavedItemRepository) so a CosmosProductRepository can be introduced later
// via dependency injection without touching this interface or any endpoint.
public class InMemoryProductRepository : IProductRepository
{
    private readonly List<Product> _products = new()
    {
        new Product("prod-001", "Trail Running Shoes", "Footwear", 129.99m, "Lightweight shoes built for uneven terrain."),
        new Product("prod-002", "Insulated Water Bottle", "Accessories", 24.50m, "Keeps drinks cold for 24 hours."),
        new Product("prod-003", "Packable Rain Jacket", "Outerwear", 89.00m, "Folds into its own pocket."),
        new Product("prod-004", "Merino Wool Socks", "Footwear", 18.00m, "Odor-resistant, moisture-wicking."),
        new Product("prod-005", "Compact Camping Stove", "Gear", 64.99m, "Boils half a liter in under 3 minutes."),
        new Product("prod-006", "Ultralight Sleeping Bag", "Gear", 210.00m, "Rated to 20°F, packs to the size of a loaf of bread."),
        new Product("prod-007", "Polarized Sunglasses", "Accessories", 45.00m, "UV400 protection, anti-glare lenses."),
        new Product("prod-008", "Daypack, 22L", "Bags", 74.99m, "Hydration-bladder compatible."),
        new Product("prod-009", "Trekking Poles (Pair)", "Gear", 55.00m, "Adjustable, carbon-fiber shafts."),
        new Product("prod-010", "Headlamp, 350 Lumens", "Accessories", 32.00m, "Rechargeable via USB-C."),
        new Product("prod-011", "Softshell Hiking Pants", "Outerwear", 68.00m, "Reinforced knees, articulated fit."),
        new Product("prod-012", "Collapsible Camp Chair", "Gear", 39.99m, "Packs down to 15 inches."),
    };

    public IReadOnlyList<Product> GetAll() => _products;

    public Product? GetById(string id) => _products.FirstOrDefault(p => p.Id == id);
}

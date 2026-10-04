namespace Api.Features.Products;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        app.MapGet("/api/products", (IProductRepository repo) =>
            Results.Ok(repo.GetAll()));

        app.MapGet("/api/products/{id}", (string id, IProductRepository repo) =>
        {
            var product = repo.GetById(id);
            return product is not null ? Results.Ok(product) : Results.NotFound();
        });
    }
}

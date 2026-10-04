namespace Api.Features.Products;

public interface IProductRepository
{
    IReadOnlyList<Product> GetAll();
    Product? GetById(string id);
}

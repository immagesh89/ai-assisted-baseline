using Api.Features.Products;
using Xunit;

namespace Api.Tests.Features.Products;

public class InMemoryProductRepositoryTests
{
    [Fact]
    public void GetAll_ReturnsSeededProducts()
    {
        var repo = new InMemoryProductRepository();

        var products = repo.GetAll();

        Assert.NotEmpty(products);
    }

    [Fact]
    public void GetById_KnownId_ReturnsMatchingProduct()
    {
        var repo = new InMemoryProductRepository();

        var product = repo.GetById("prod-001");

        Assert.NotNull(product);
        Assert.Equal("prod-001", product!.Id);
    }

    [Fact]
    public void GetById_UnknownId_ReturnsNull()
    {
        var repo = new InMemoryProductRepository();

        var product = repo.GetById("does-not-exist");

        Assert.Null(product);
    }
}

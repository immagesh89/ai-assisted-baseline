using System.Net;
using System.Net.Http.Json;
using Api.Features.Products;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Api.Tests.Features.Products;

// Establishes the endpoint-testing pattern this repo expects — mirror this
// shape (IClassFixture<WebApplicationFactory<Program>>, real HTTP calls, no
// mocking of the pipeline) for the new SavedItems endpoints. See AGENTS.md.
public class ProductEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ProductEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetProducts_ReturnsOkWithSeededList()
    {
        var response = await _client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var products = await response.Content.ReadFromJsonAsync<List<Product>>();
        Assert.NotNull(products);
        Assert.NotEmpty(products!);
    }

    [Fact]
    public async Task GetProductById_KnownId_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/products/prod-001");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetProductById_UnknownId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/products/does-not-exist");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

using System.Net;
using System.Net.Http.Json;
using Api.Features.SavedItems;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Api.Tests.Features.SavedItems;

// Mirrors ProductEndpointsTests: WebApplicationFactory<Program>, real HTTP
// requests, no pipeline mocking. The in-memory store is a singleton for the
// life of the app, so every test saves under its own user id to stay isolated.
public class SavedItemEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public SavedItemEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task SaveProduct_FirstSave_ReturnsCreated()
    {
        var response = await SendAsync(HttpMethod.Post, "/api/products/prod-001/save", "user-save-created");

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var item = await response.Content.ReadFromJsonAsync<SavedItem>();
        Assert.NotNull(item);
        Assert.Equal("prod-001", item!.ProductId);
        Assert.Equal("user-save-created", item.UserId);
    }

    [Fact]
    public async Task SaveProduct_RepeatSave_ReturnsOkWithoutDuplicating()
    {
        var userId = "user-save-repeat";
        await SendAsync(HttpMethod.Post, "/api/products/prod-002/save", userId);

        var response = await SendAsync(HttpMethod.Post, "/api/products/prod-002/save", userId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var items = await GetSavedItemsAsync(userId);
        Assert.Single(items);
    }

    [Fact]
    public async Task SaveProduct_AtTheLimit_ReturnsConflict()
    {
        // A saved item is an opaque reference to a product id, so the cap can be
        // exercised with more ids than the seeded catalog holds.
        var userId = "user-save-limit";
        for (var i = 0; i < ISavedItemRepository.MaxItemsPerUser; i++)
        {
            var response = await SendAsync(HttpMethod.Post, $"/api/products/prod-{i:00}/save", userId);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        var conflict = await SendAsync(HttpMethod.Post, "/api/products/prod-over/save", userId);

        Assert.Equal(HttpStatusCode.Conflict, conflict.StatusCode);

        var items = await GetSavedItemsAsync(userId);
        Assert.Equal(ISavedItemRepository.MaxItemsPerUser, items.Count);
    }

    [Fact]
    public async Task SaveProduct_WithoutUserIdHeader_ReturnsUnauthorized()
    {
        var response = await SendAsync(HttpMethod.Post, "/api/products/prod-001/save", userId: null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RemoveSavedProduct_SavedProduct_ReturnsNoContent()
    {
        var userId = "user-remove-saved";
        await SendAsync(HttpMethod.Post, "/api/products/prod-003/save", userId);

        var response = await SendAsync(HttpMethod.Delete, "/api/products/prod-003/save", userId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Empty(await GetSavedItemsAsync(userId));
    }

    [Fact]
    public async Task RemoveSavedProduct_NotSaved_ReturnsNoContent()
    {
        var response = await SendAsync(HttpMethod.Delete, "/api/products/prod-004/save", "user-remove-missing");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task RemoveSavedProduct_WithoutUserIdHeader_ReturnsUnauthorized()
    {
        var response = await SendAsync(HttpMethod.Delete, "/api/products/prod-001/save", userId: null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetSavedItems_NoneSaved_ReturnsEmptyArray()
    {
        var response = await SendAsync(HttpMethod.Get, "/api/saved-items", "user-list-empty");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var items = await response.Content.ReadFromJsonAsync<List<SavedItem>>();
        Assert.NotNull(items);
        Assert.Empty(items!);
    }

    [Fact]
    public async Task GetSavedItems_ReturnsMostRecentlySavedFirst()
    {
        var userId = "user-list-order";
        await SendAsync(HttpMethod.Post, "/api/products/prod-005/save", userId);
        await SendAsync(HttpMethod.Post, "/api/products/prod-006/save", userId);
        await SendAsync(HttpMethod.Post, "/api/products/prod-007/save", userId);

        var items = await GetSavedItemsAsync(userId);

        Assert.Equal(["prod-007", "prod-006", "prod-005"], items.Select(item => item.ProductId));
    }

    [Fact]
    public async Task GetSavedItems_OnlyReturnsTheRequestingUsersItems()
    {
        await SendAsync(HttpMethod.Post, "/api/products/prod-008/save", "user-list-scope-a");
        await SendAsync(HttpMethod.Post, "/api/products/prod-009/save", "user-list-scope-b");

        var items = await GetSavedItemsAsync("user-list-scope-a");

        Assert.Equal(["prod-008"], items.Select(item => item.ProductId));
    }

    [Fact]
    public async Task GetSavedItems_WithoutUserIdHeader_ReturnsUnauthorized()
    {
        var response = await SendAsync(HttpMethod.Get, "/api/saved-items", userId: null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private Task<HttpResponseMessage> SendAsync(HttpMethod method, string path, string? userId)
    {
        var request = new HttpRequestMessage(method, path);
        if (userId is not null)
        {
            request.Headers.Add("X-User-Id", userId);
        }

        return _client.SendAsync(request);
    }

    private async Task<List<SavedItem>> GetSavedItemsAsync(string userId)
    {
        var response = await SendAsync(HttpMethod.Get, "/api/saved-items", userId);
        response.EnsureSuccessStatusCode();

        var items = await response.Content.ReadFromJsonAsync<List<SavedItem>>();
        return items ?? [];
    }
}
using Api.Features.SavedItems;
using Xunit;

namespace Api.Tests.Features.SavedItems;

public class InMemorySavedItemRepositoryTests
{
    [Fact]
    public void Save_FirstTime_ReturnsCreatedWithStoredDocument()
    {
        var repo = new InMemorySavedItemRepository();

        var result = repo.Save("user-1", "prod-001");

        Assert.Equal(SaveStatus.Created, result.Status);
        Assert.NotNull(result.Item);
        Assert.Equal("user-1:prod-001", result.Item!.Id);
        Assert.Equal("user-1", result.Item.UserId);
        Assert.Equal("prod-001", result.Item.ProductId);
    }

    [Fact]
    public void Save_SameProductTwice_IsIdempotent()
    {
        var repo = new InMemorySavedItemRepository();

        var first = repo.Save("user-1", "prod-001");
        var second = repo.Save("user-1", "prod-001");

        Assert.Equal(SaveStatus.Created, first.Status);
        Assert.Equal(SaveStatus.AlreadySaved, second.Status);
        Assert.Equal(first.Item, second.Item);
        Assert.Single(repo.GetByUser("user-1"));
    }

    [Fact]
    public void Save_DistinctUsers_AreIsolated()
    {
        var repo = new InMemorySavedItemRepository();

        repo.Save("user-1", "prod-001");

        Assert.Empty(repo.GetByUser("user-2"));
    }

    [Fact]
    public void Save_BeyondTheLimit_ReportsLimitReached()
    {
        var repo = new InMemorySavedItemRepository();

        for (var i = 0; i < ISavedItemRepository.MaxItemsPerUser; i++)
        {
            Assert.Equal(SaveStatus.Created, repo.Save("user-1", $"prod-{i}").Status);
        }

        var result = repo.Save("user-1", "prod-over-the-limit");

        Assert.Equal(SaveStatus.LimitReached, result.Status);
        Assert.Null(result.Item);
        Assert.Equal(ISavedItemRepository.MaxItemsPerUser, repo.GetByUser("user-1").Count);
    }

    [Fact]
    public void Save_WhenAlreadySaved_DoesNotCountAgainstTheLimit()
    {
        var repo = new InMemorySavedItemRepository();

        for (var i = 0; i < ISavedItemRepository.MaxItemsPerUser; i++)
        {
            repo.Save("user-1", $"prod-{i}");
        }

        var result = repo.Save("user-1", "prod-0");

        Assert.Equal(SaveStatus.AlreadySaved, result.Status);
    }

    [Fact]
    public void GetByUser_ReturnsMostRecentlySavedFirst()
    {
        var repo = new InMemorySavedItemRepository();

        repo.Save("user-1", "prod-001");
        repo.Save("user-1", "prod-002");
        repo.Save("user-1", "prod-003");

        var items = repo.GetByUser("user-1");

        Assert.Equal(["prod-003", "prod-002", "prod-001"], items.Select(item => item.ProductId));
    }

    [Fact]
    public void GetByUser_UnknownUser_ReturnsEmpty()
    {
        var repo = new InMemorySavedItemRepository();

        Assert.Empty(repo.GetByUser("nobody"));
    }

    [Fact]
    public void Remove_SavedProduct_DropsIt()
    {
        var repo = new InMemorySavedItemRepository();
        repo.Save("user-1", "prod-001");

        var removed = repo.Remove("user-1", "prod-001");

        Assert.True(removed);
        Assert.Empty(repo.GetByUser("user-1"));
    }

    [Fact]
    public void Remove_ProductThatIsNotSaved_ReturnsFalse()
    {
        var repo = new InMemorySavedItemRepository();

        Assert.False(repo.Remove("user-1", "prod-001"));
    }

    [Fact]
    public void Remove_OnlyAffectsTheGivenUser()
    {
        var repo = new InMemorySavedItemRepository();
        repo.Save("user-1", "prod-001");
        repo.Save("user-2", "prod-001");

        repo.Remove("user-1", "prod-001");

        Assert.Empty(repo.GetByUser("user-1"));
        Assert.Single(repo.GetByUser("user-2"));
    }

    [Fact]
    public void Remove_FreesUpRoomUnderTheLimit()
    {
        var repo = new InMemorySavedItemRepository();
        for (var i = 0; i < ISavedItemRepository.MaxItemsPerUser; i++)
        {
            repo.Save("user-1", $"prod-{i}");
        }

        repo.Remove("user-1", "prod-0");

        Assert.Equal(SaveStatus.Created, repo.Save("user-1", "prod-new").Status);
    }
}
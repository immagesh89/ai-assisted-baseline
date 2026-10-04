namespace Api.Features.SavedItems;

public static class SavedItemEndpoints
{
    // Stubbed auth for now: the signed-in user arrives in an X-User-Id header and
    // a request without one is treated as unauthenticated. Replace this check with
    // real authentication without changing the repository or the handlers.
    private const string UserIdHeader = "X-User-Id";

    public static void MapSavedItemEndpoints(this WebApplication app)
    {
        app.MapPost("/api/products/{productId}/save", (string productId, HttpContext context, ISavedItemRepository savedItems) =>
        {
            if (!TryGetUserId(context, out var userId))
            {
                return Results.Unauthorized();
            }

            var result = savedItems.Save(userId, productId);

            return result.Status switch
            {
                SaveStatus.Created => Results.Json(result.Item, statusCode: StatusCodes.Status201Created),
                SaveStatus.AlreadySaved => Results.Ok(result.Item),
                _ => Results.Problem(
                    title: "Saved item limit reached",
                    detail: $"You can save up to {ISavedItemRepository.MaxItemsPerUser} products. Un-save one to save another.",
                    statusCode: StatusCodes.Status409Conflict)
            };
        });

        // Removing something that isn't saved is not an error, so the outcome is
        // always 204 regardless of what the repository reports.
        app.MapDelete("/api/products/{productId}/save", (string productId, HttpContext context, ISavedItemRepository savedItems) =>
        {
            if (!TryGetUserId(context, out var userId))
            {
                return Results.Unauthorized();
            }

            savedItems.Remove(userId, productId);

            return Results.NoContent();
        });

        app.MapGet("/api/saved-items", (HttpContext context, ISavedItemRepository savedItems) =>
        {
            if (!TryGetUserId(context, out var userId))
            {
                return Results.Unauthorized();
            }

            return Results.Ok(savedItems.GetByUser(userId));
        });
    }

    private static bool TryGetUserId(HttpContext context, out string userId)
    {
        var header = context.Request.Headers[UserIdHeader].ToString().Trim();
        userId = header;

        return userId.Length > 0;
    }
}
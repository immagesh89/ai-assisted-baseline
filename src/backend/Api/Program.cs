using Api.Features.Products;
using Api.Features.SavedItems;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IProductRepository, InMemoryProductRepository>();
builder.Services.AddSingleton<ISavedItemRepository, InMemorySavedItemRepository>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors();

app.MapProductEndpoints();
app.MapSavedItemEndpoints();

app.Run();

// Exposed so Api.Tests can spin the app up in-memory via WebApplicationFactory<Program>.
public partial class Program { }

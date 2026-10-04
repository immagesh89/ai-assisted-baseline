using Api.Features.Products;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IProductRepository, InMemoryProductRepository>();

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

app.Run();

// Exposed so Api.Tests can spin the app up in-memory via WebApplicationFactory<Program>.
public partial class Program { }

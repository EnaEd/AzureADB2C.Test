using AzureADB2C.Test.Client;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri("https://localhost:6001") });

builder.Services.AddMsalAuthentication(options =>
{
    builder.Configuration.Bind("AzureAdB2C", options.ProviderOptions.Authentication);
    options.ProviderOptions.DefaultAccessTokenScopes = new[]
    {
        "https://testd4drivers.onmicrosoft.com/d4driverstesttask-api/tasks.write",
        "https://testd4drivers.onmicrosoft.com/d4driverstesttask-api/tasks.read"
    };
});

await builder.Build().RunAsync();

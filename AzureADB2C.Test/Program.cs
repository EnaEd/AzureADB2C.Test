using AzureADB2C.Test;
using AzureADB2C.Test.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AzureADB2CContext>(options => options.UseInMemoryDatabase("test"))
    .AddIdentity<AzureUser,IdentityRole<int>>()
    .AddEntityFrameworkStores<AzureADB2CContext>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddMicrosoftIdentityWebApi(options =>
    {
        builder.Configuration.Bind("AzureAdB2C", options);
        options.TokenValidationParameters.NameClaimType = "name";
    },
    options =>
    {
        builder.Configuration.Bind("AzureAdB2C", options);
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policyBuilder => policyBuilder
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
//app.MapGet("/", () => "Hello World!");
//app.MapGet("/hi", () => "Hello World!").RequireAuthorization();
//app.MapGet("/h2", [AuthorizationFilter] () => "Hello World!").AddEndpointFilter.RequireAuthorization();

app.Run();
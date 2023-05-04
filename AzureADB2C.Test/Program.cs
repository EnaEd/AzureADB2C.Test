using System.Diagnostics;
using AzureADB2C.Test;
using AzureADB2C.Test.Entities;
using Microsoft.AspNetCore.Authentication.Certificate;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.Server.Kestrel.Https;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using Synetec.Authorization.Extensions;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<AzureADB2CContext>(options => options.UseInMemoryDatabase("test"))
    .AddIdentity<AzureUser, IdentityRole<int>>()
    .AddEntityFrameworkStores<AzureADB2CContext>();

builder.AddSynetecCertificateAuthentication().AddSynetecJWTAuthentication("AzureAdB2C");
//builder.Services.AddAuthentication(CertificateAuthenticationDefaults.AuthenticationScheme).AddCertificate(certOptions =>
//{
//    certOptions.Events = new CertificateAuthenticationEvents
//    {
//        OnAuthenticationFailed = context =>
//        {
//            Console.WriteLine("in fail");
//            Debug.WriteLine("in fail");
//            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
//            return Task.CompletedTask;
//        },
//        OnChallenge = context =>
//        {
//            Console.WriteLine("onchallenge");
//            Debug.WriteLine("onchallenge");
//            return Task.CompletedTask;
//        },
//        OnCertificateValidated = context =>
//        {
//            Console.WriteLine("in success");
//            Debug.WriteLine("in success");
//            context.Success();
//            return Task.CompletedTask;
//        }
//    };
//    certOptions.AllowedCertificateTypes = CertificateTypes.All;
//});

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddMicrosoftIdentityWebApi(options =>
//        {
//            builder.Configuration.Bind("AzureAdB2C", options);
//            options.TokenValidationParameters.NameClaimType = "name";
//        },
//        options => { builder.Configuration.Bind("AzureAdB2C", options); });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policyBuilder => policyBuilder
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers();

var app = builder.Build();

//app.UseHttpsRedirection();

app.UseRouting();
app.UseCors();
//app.UseForwardedHeaders();
//app.UseCertificateForwarding();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
//app.MapGet("/", () => "Hello World!");
//app.MapGet("/hi", () => "Hello World!").RequireAuthorization();
//app.MapGet("/h2", [AuthorizationFilter] () => "Hello World!").AddEndpointFilter.RequireAuthorization();

app.Run();
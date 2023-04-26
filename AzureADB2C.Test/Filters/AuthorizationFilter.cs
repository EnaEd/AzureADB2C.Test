using Microsoft.AspNetCore.Mvc.Filters;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using AzureADB2C.Test.Entities;
using Microsoft.AspNetCore.Identity;

namespace AzureADB2C.Test.Filters;

public class AuthorizationFilter : IAuthorizationFilter
{
    private readonly UserManager<AzureUser> _userManager;

    public AuthorizationFilter(UserManager<AzureUser> userManager)
    {
        _userManager = userManager;
    }

    public async void OnAuthorization(AuthorizationFilterContext context)
    {
        var headersAuthorization = context.HttpContext.Request.Headers.Authorization.ToString();
        var parsedToken = headersAuthorization.Replace("Bearer", string.Empty).Trim();
        //parse azure jwt to get email
        var handler = new JwtSecurityTokenHandler();
        var jsonToken = handler.ReadToken(parsedToken);
        var tokenS = jsonToken as JwtSecurityToken;
        var email = tokenS.Claims.FirstOrDefault(x => x.Type == "emails");

        //call to userDb and throw 401 if don't have this email
        var user = await _userManager.FindByEmailAsync(email?.Value) ?? throw new Exception();

        //next steps is to check users permissions and roles
        // and throw 401/403 exception if user

        var stop = string.Empty;
    }
}
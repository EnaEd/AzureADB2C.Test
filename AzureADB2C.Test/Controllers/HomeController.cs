using AzureADB2C.Test.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace AzureADB2C.Test.Controllers;

public class HomeController : Controller
{
    [HttpGet("/")]
    public async Task<IActionResult> TestPoint()
    {
        return Ok("HelloWorld");
    }

    [Authorize]
    [HttpGet("/hi")]
    public async Task<IActionResult> HiPoint()
    {
        return Ok("HelloWorld");
    }

    [TypeFilter(typeof(AuthorizationFilter))]
    [HttpGet("/hifilter")]
    public async Task<IActionResult> HiFilterPoint()
    {
        return Ok("HelloWorld");
    }

    [HttpPost("/enrich")]
    public async Task<IActionResult> EnrichPoint([FromBody] JsonElement body)
    {
        var test = body.GetProperty("email");

        //place to get user info by mail and enrich his roles and permissions
        var extendetRoles = "Manager";
        return GetContinueApiResponse("GetAppRoles-Succeeded", "Your app roles were successfully determined.", extendetRoles);
    }

    private IActionResult GetContinueApiResponse(string code, string userMessage, string appRoles)
    {
        return GetB2cApiConnectorResponse("Continue", code, userMessage, 200, appRoles);
    }

    private IActionResult GetB2cApiConnectorResponse(string action, string code, string userMessage, int statusCode, string appRoles)
    {
        var responseProperties = new Dictionary<string, object>
        {
            { "version", "1.0.0" },
            { "action", action },
            { "userMessage", userMessage },
            { "extension_Role", appRoles }
        };
        if (statusCode != 200)
        {
            // Include the status in the body as well, but only for validation errors.
            responseProperties["status"] = statusCode.ToString();
        }
        return new JsonResult(responseProperties) { StatusCode = statusCode };
    }
}
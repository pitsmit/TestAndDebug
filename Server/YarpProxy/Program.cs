using System.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using Yarp.ReverseProxy.Forwarder;
using Yarp.ReverseProxy.Model;

// C:\php\php.exe -S localhost:8080
// dotnet run

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddHttpForwarder();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

var app = builder.Build();

app.UseForwardedHeaders();

app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "static")),
    RequestPath = ""
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "legacy")),
    RequestPath = "/legacy"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "management")),
    RequestPath = "/management"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "documentation")),
    RequestPath = "/documentation"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "downloads")),
    RequestPath = "/downloads"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "admin")),
    RequestPath = "/adminer",
    ServeUnknownFileTypes = true
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "readme")),
    RequestPath = "/readme"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "..")),
    RequestPath = "/readmesrc"
});

app.MapGet("/status", async (HttpContext context) =>
{
    var uptime = DateTime.Now - Process.GetCurrentProcess().StartTime;

    string backendStatus;
    string backendStatusClass = "status-value";

    try
    {
        using var client = new HttpClient();
        var response = await client.GetAsync("http://localhost:3000/api/health");
        backendStatus = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy";
        backendStatusClass = response.IsSuccessStatusCode ? "status-value" : "status-value status-warning";
    }
    catch (Exception)
    {
        backendStatus = "Down";
        backendStatusClass = "status-value status-down";
    }

    var html = $@"
<!DOCTYPE html>
<html lang=""ru"">
<head>
    <meta charset=""UTF-8"">
    <meta http-equiv=""refresh"" content=""5"">
    <title>Server Status</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f0f0f0;
        }}
        .container {{
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 25px;
        }}
        h1 {{
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }}
        .status-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }}
        .status-card {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }}
        .status-value {{
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
        }}
        .status-warning {{
            color: #ffc107;
        }}
        .status-down {{
            color: #dc3545;
        }}
    </style>
</head>
<body>
<div class=""container"">
    <h1>Server Status Monitor</h1>

    <div class=""status-grid"">
        <div class=""status-card"">
            <h3>YARP Proxy Status</h3>
            <div class=""status-value"">Running</div>
        </div>

        <div class=""status-card"">
            <h3>Backend API Status</h3>
            <div class=""{backendStatusClass}"">{backendStatus}</div>
        </div>

        <div class=""status-card"">
            <h3>Uptime</h3>
            <div class=""status-value"">{uptime:g}</div>
        </div>

        <div class=""status-card"">
            <h3>Backend URL</h3>
            <div class=""status-value"">http://localhost:3000</div>
        </div>
    </div>
</div>
</body>
</html>";

    context.Response.ContentType = "text/html";
    await context.Response.WriteAsync(html);
});

app.MapGet("/admin", async (HttpContext context) =>
{
    context.Response.Redirect("http://localhost:8080/adminer.php?pgsql=localhost&username=postgres&db=Anekdotus");
});

app.MapGet("/legacy", async (HttpContext context) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "legacy", "index.html");
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(filePath);
});

app.MapGet("/management", async (HttpContext context) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "management", "index.html");
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(filePath);
});

app.MapGet("/documentation", async (HttpContext context) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "documentation", "index.html");
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(filePath);
});

app.MapGet("/", async (HttpContext context) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "static", "index.html");
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(filePath);
});

app.MapGet("/api/v1", async (HttpContext context) =>
{
    context.Response.Redirect("/api-docs/");
});

app.MapGet("/reserved", async (HttpContext context) =>
{
    context.Response.Redirect("/");
});

app.MapReverseProxy();
app.Run();
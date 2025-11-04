using System.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using Yarp.ReverseProxy.Forwarder;

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

app.MapGet("/status", async (HttpContext context) =>
{
    var uptime = DateTime.Now - Process.GetCurrentProcess().StartTime;

    var status = $@"
YARP Proxy Server Status
-----------------------
Status:    Running
Port:      5064
Uptime:    {uptime:g}
Timestamp: {DateTime.Now:yyyy-MM-dd HH:mm:ss}
Backend:   http://localhost:3000
";

    context.Response.ContentType = "text/plain";
    await context.Response.WriteAsync(status);
});

app.MapGet("/admin", async (HttpContext context) =>
{
    context.Response.Redirect("http://localhost:8080/adminer.php?pgsql=localhost&username=postgres&db=Anekdotus");
});
// Явные маршруты для статических страниц
app.MapGet("/legacy", async (HttpContext context) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "legacy", "index.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Legacy page not found. Create legacy/index.html");
    }
});

app.MapGet("/management", async (HttpContext context) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "management", "index.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Management page not found. Create management/index.html");
    }
});

app.MapGet("/documentation", async (HttpContext context) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "documentation", "index.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Documentation page not found. Create documentation/index.html");
    }
});

// Главная страница
app.MapGet("/", async (HttpContext context) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "static", "index.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Main page not found. Create static/index.html");
    }
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
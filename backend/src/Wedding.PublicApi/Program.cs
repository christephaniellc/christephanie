using Amazon.Extensions.NETCore.Setup;
using Autofac;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System;
using System.Text.Json.Serialization;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Configuration;
using Wedding.Common.Web.Extensions;
using Wedding.Common.Web.Options;
using Wedding.PublicApi.Logic.DI;
using Wedding.PublicApi.Swagger;

var assemblies = new[]
{
    typeof(Program).Assembly,
    typeof(Wedding.PublicApi.RegistrationHook).Assembly,
    //typeof(Wedding.Abstractions.RegistrationHook).Assembly
};

var builder = WebApplication
        .CreateBuilder(args)
        .ForRole(
            typeof(Program), 
            assemblies)
       // .WithDynamoDataContext()
    //,
    //typeof(Data.Domain.RegistrationHook).Assembly)
    //.WithBoundedDataContext<EnginePoolContext>();
    ; 

var env = builder.Environment;
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Environment.GetEnvironmentVariable("ADMIN_API_USER")
var isDevAdmin = !string.IsNullOrEmpty(builder.Configuration["ADMIN_API_USER"]) 
                 && string.Equals(builder.Configuration["ADMIN_API_USER"], "steph", StringComparison.OrdinalIgnoreCase);

// var connectionStrings = builder.Configuration
//     .GetSection(ConnectionStringsOptions.ConnectionStrings);


builder.Services
    .AddOptions<ConnectionStringsOptions>()
    .Bind(builder.Configuration.GetSection(ConnectionStringsOptions.ConnectionStrings))
;

//var awsOptions = builder.Configuration.GetAWSOptions();
// builder.Services
//     .AddOptions<AWSOptions>()
//     .Bind(builder.Configuration.GetSection("AWS"))
//     .ValidateDataAnnotations();


// TODO: SKS this helped with debugging
//builder.Services.AddHostedService<DependencyDebuggingService>();

// var tracer = new DefaultDiagnosticTracer();
// builder.RegisterBuildCallback(container =>
// {
//     container.SubscribeToDiagnostics(tracer);
// });


// var client = new AmazonDynamoDBClient(new StoredProfileAWSCredentials("christephanie-dynamodb-user"), RegionEndpoint.USEast1);
// var request = new ListTablesRequest();
// var response = await client.ListTablesAsync(request);

// Console.WriteLine(string.Join(", ", response.TableNames));

builder.Services
    .AddWeddingAutomapper();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{

    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Christephanie API", Version = "v1" });
    options.OperationFilter<AddResponsesOperationFilter>();
    options.DocInclusionPredicate((docName, apiDesc) =>
    {
        // Exclude endpoints with an empty path (e.g., "/")
        return !string.IsNullOrWhiteSpace(apiDesc.RelativePath);
    });
});

// Configure Kestrel to use specific ports
// builder.WebHost.ConfigureKestrel(options =>
// {
//     options.ListenLocalhost(5030); // HTTP port
//     options.ListenLocalhost(7214, listenOptions => listenOptions.UseHttps()); // HTTPS port
// });

builder.Services.Add(
    (ContainerBuilder cb) =>
    {
        var awsOptions = builder.Configuration.GetAWSOptions();
        var uspsOptions = builder.Configuration.GetSection(ConfigurationKeys.USPS).Get<UspsOptions>()!;

        cb.RegisterModule(new LogicModule());
        cb.RegisterModule(new AwsModule(awsOptions));
        cb.RegisterModule(new UspsModule(uspsOptions));

        if (env.IsDevelopment())
        {
            cb.RegisterModule(new AuthModuleNoOp(isDevAdmin));
        }
        else
        {
            var auth0Config = builder.Configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
            cb.RegisterModule(new AuthModule(auth0Config.ApiBaseUrl!));
        }
    }
);

var app = builder.Build(options =>
    {
        options.UseDefaultHttpCaching = false;
        options.UseDefaultMessaging = false;
        options.UseDefaultObservability = false;
        options.UseDefaultHealthChecks = false;
        options.PostBuildOptions.UseHealthChecks = false;
        options.PostBuildOptions.UseEndpointControllerMappings = false;
        options.UseDefaultLogging = false;
    }
);

app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

// app.UseHttpsRedirection();
//
// app.UseAuthorization();
//
//app.MapControllers();

#pragma warning disable ASP0014
app.UseRouting();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});
#pragma warning restore ASP0014

app.Run();

using System;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Reflection;
using System.Text.Json.Serialization;
using Autofac;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using Wedding.Common.Web.DI;
using Wedding.Common.Web.Options;

namespace Wedding.Common.Web.Extensions
{
    /// <summary>
    /// Public API application _builder
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class PublicApiApplicationBuilder
    {
        private readonly WebApplicationBuilder _builder;
        private readonly Type _entryPoint;
        private readonly DefaultApiOptions _roleOptions;

        /// <summary>
        /// Creates an instance of the application _builder
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="entryPoint"></param>
        /// <param name="assemblies"></param>
        public PublicApiApplicationBuilder(WebApplicationBuilder builder, Type entryPoint, Assembly[] assemblies) : this(builder, entryPoint, true, assemblies)
        {
        }

        /// <summary>
        /// Creates an instance of the application _builder
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="entryPoint"></param>
        /// <param name="useDefaultConfiguration"></param>
        /// <param name="assemblies"></param>
        public PublicApiApplicationBuilder(WebApplicationBuilder builder, Type entryPoint, bool useDefaultConfiguration, Assembly[] assemblies)
        {
            _roleOptions = new DefaultApiOptions(assemblies);
            _builder = builder;
            _entryPoint = entryPoint;

            if (!useDefaultConfiguration)
            {
                return;
            }

            //use vault key per file
            _ = _builder.Configuration
                //Include Environment Variable DOTNET_USE_POLLING_FILE_WATCHER=true so reloadOnChange functions correctly with sym-linked files ( https://github.com/dotnet/runtime/issues/36091 ).
                .AddKeyPerFile("/var/publicapi-vault", true, true);

            //look for key-vault urls in the environment
            // if (_builder.Environment.IsDevelopment() &&
            //     !string.IsNullOrEmpty(System.Environment.GetEnvironmentVariable("KeyVaultUrls")))
            // {
            //     _ = _builder.Configuration.AddAzureKeyVaultWithDefaultCredentials(
            //         System.Environment.GetEnvironmentVariable("KeyVaultUrls")!);
            //
            //     _ = _builder.Configuration.AddJsonFile($"appsettings.{System.Environment.UserName}.json", optional: true);
            // }

            //add the environment
            _ = _builder.Configuration.AddEnvironmentVariables();
        }

        /// <summary>
        /// Gets the services collection
        /// </summary>
        public IServiceCollection Services => _builder.Services;

        /// <summary>
        /// Gets the configuration
        /// </summary>
        public ConfigurationManager Configuration => _builder.Configuration;

        /// <summary>
        /// Gets the environment
        /// </summary>
        public IWebHostEnvironment Environment => _builder.Environment;

        /// <summary>
        /// Gets the host
        /// </summary>
        public ConfigureHostBuilder Host => _builder.Host;

        /// <summary>
        /// Gets the web host
        /// </summary>
        public ConfigureWebHostBuilder WebHost => _builder.WebHost;

        /// <summary>
        /// Adds a custom data context the application.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        public PublicApiApplicationBuilder WithBoundedDataContext<T>() where T : DbContext
        {
            //_ = _builder.Services.AddCosmosBoundedDataContext<T>();
            return this;
        }

        /// <summary>
        /// Runs the role
        /// </summary>
        public WebApplication Build(Action<DefaultApiOptions>? action = null)
        {
            action?.Invoke(_roleOptions);

            //configure autofac as the service provider factory
            _ = _builder
                .Host
                .ConfigureAutofacContainer(_builder.Services);

            var services = _builder.Services;

            _ = services.AddProblemDetails();
            _ = services.AddHttpContextAccessor();

            if (_roleOptions.UseDefaultLogging)
            {
                _ = services
                    .AddLogging(
                        options =>
                        {
                            _ = options
                                .ClearProviders()
                                .AddConfiguration(_builder.Configuration.GetSection("Logging"));
                            _ = _builder.Environment.IsDevelopment()
                                ? options.AddSimpleConsole(simpleConsoleOptions =>
                                {
                                    simpleConsoleOptions.ColorBehavior =
                                        Microsoft.Extensions.Logging.Console.LoggerColorBehavior.Disabled;
                                    simpleConsoleOptions.IncludeScopes = true;
                                    simpleConsoleOptions.UseUtcTimestamp = true;
                                    simpleConsoleOptions.TimestampFormat = "[yyyy-MM-dd HH:mm:ss.fff] ";
                                })
                                : options
                                    .AddJsonConsole(
                                        options2 => options2.IncludeScopes = true);

                            _ = options.Configure(o => o.ActivityTrackingOptions |= ActivityTrackingOptions.Tags | ActivityTrackingOptions.ParentId | ActivityTrackingOptions.TraceId | ActivityTrackingOptions.SpanId);
                        })
                    .Add(containerBuilder => containerBuilder.RegisterModule<LoggingModule>());
            }

            if (_roleOptions.UseDefaultCors)
            {
                _ = services
                    .AddCors();
            }

            if (_roleOptions.UseDefaultResponseCaching)
            {
                _ = services.AddResponseCaching();
            }

            if (_roleOptions.ConfigureRequestTimeouts != null)
            {
                var requestTimeoutOptions = new DefaultRequestTimeoutOptions();
                _roleOptions.ConfigureRequestTimeouts(requestTimeoutOptions);

                _ = services.AddRequestTimeouts(o =>
                {
                    _ = o.DefaultPolicy = new RequestTimeoutPolicy { Timeout = requestTimeoutOptions.DefaultTimeout };
                    // apply additional customizations if consumer has set them
                    requestTimeoutOptions.Options?.Invoke(o);
                });
            }

            _ = _builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                // In development we want to listen on a custom port.
                var listenPortEnv = System.Environment.GetEnvironmentVariable("DEV_LISTEN_PORT");
                if (_builder.Environment.IsDevelopment() && listenPortEnv != null &&
                    int.TryParse(listenPortEnv, out var listenPort))
                {
                    // Explicit loopback usage avoids angering some system FW software vs use of 0.0.0.0.
                    serverOptions.Listen(IPAddress.Loopback, listenPort);
                }
            });

            var app = _builder.Build();

            // if (_roleOptions.PostBuildOptions.UseCoreApplicationConfiguration)
            // {
            //     _ = app.UseMiddleware<DatadogLoggingContextWithoutExceptionMiddleware>();
            //
            //     if (app.Environment.IsDevelopment())
            //     {
            //         var enableDevExceptionPage = System.Environment.GetEnvironmentVariable("DEV_EXCEPTION_PAGE");
            //         _ = enableDevExceptionPage != null && bool.TryParse(enableDevExceptionPage, out var enableDevExceptionPageBool)
            //             && enableDevExceptionPageBool
            //             ? app.UseDeveloperExceptionPage()
            //             : app.UseExceptionHandler();
            //
            //         _ = app.UseCors(corsPolicyBuilder =>
            //         {
            //             // Add headers here
            //             _ = corsPolicyBuilder.AllowAnyOrigin();
            //             _ = corsPolicyBuilder.AllowAnyMethod();
            //             _ = corsPolicyBuilder.AllowAnyHeader();
            //             //_builder.AllowCredentials();
            //         });
            //     }
            //     else
            //     {
            //         _ = app.UseExceptionHandler();
            //
            //         _ = app.UseHsts();
            //
            //         _ = app.UseDefaultFiles();
            //
            //     }
            // }

            if (_roleOptions.PostBuildOptions.UseStaticFiles)
            {
                _ = app.UseStaticFiles();
            }

            if (_roleOptions.PostBuildOptions.UseDefaultResponseCaching)
            {
                // Response caching must be added after CORS setup
                _ = app.UseResponseCaching();

                _ = app.Use(async (ctx, next) =>
                {
                    ctx.Request.GetTypedHeaders().CacheControl = new CacheControlHeaderValue()
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromMinutes(5)
                    };

                    // TODO: Utilize this if the caching storage strategy allows after wiring up Map.
                    ctx.Request.GetTypedHeaders().LastModified = new DateTimeOffset(DateTime.Now);

                    await next();

                });
            }

            // if (_roleOptions.UseDefaultApiDocs)
            // {
            //     _ = app.UseApiDocs(_builder.Environment.IsDevelopment() ? null : _roleOptions.ServiceIngressRewriteBase);
            // }

            if (_roleOptions.PostBuildOptions.UseEndpointControllerMappings)
            {
                _ = app.UseRouting();
            }

            if (_roleOptions.ConfigureRequestTimeouts != null)
            {
                _ = app.UseRequestTimeouts();
            }


            _ = (_roleOptions.PostBuildOptions.CustomMiddleware?.Invoke(app));

            if (_roleOptions.PostBuildOptions.UseAuthentication)
            {
                _ = app.UseAuthentication();
            }

            if (_roleOptions.PostBuildOptions.UseAuthorization)
            {
                _ = app.UseAuthorization();
            }

            if (_roleOptions.PostBuildOptions.UseEndpointControllerMappings)
            {
#pragma warning disable ASP0014
                _ = app.UseEndpoints(endpoints =>
                    // If you want [Authorize] on all controllers implicitly:
                    // endpoints.MapControllers().RequireAuthorization();
                    // Otherwise, you must [Authorize] individual endpoints
                    _ = endpoints.MapControllers());
#pragma warning restore ASP0014
            }

            if (_roleOptions.UseStringEnumSerialization)
            {
                _ = _builder.Services
                    .Configure<JsonOptions>(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
            }

            _ = app.MapWhen(
                context => context.Request.Path.ToString()
                    .StartsWith("/dapr/config", StringComparison.InvariantCultureIgnoreCase),
                app => app.Run(async (context) => await context.Response.CompleteAsync()));

            return app;
        }
    }

}

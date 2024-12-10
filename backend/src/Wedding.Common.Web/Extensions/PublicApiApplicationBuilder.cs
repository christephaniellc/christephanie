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
using Wedding.Common.DI;
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
            if (_builder.Environment.IsDevelopment() &&
                !string.IsNullOrEmpty(System.Environment.GetEnvironmentVariable("KeyVaultUrls")))
            {
                _ = _builder.Configuration.AddAzureKeyVaultWithDefaultCredentials(
                    System.Environment.GetEnvironmentVariable("KeyVaultUrls")!);

                _ = _builder.Configuration.AddJsonFile($"appsettings.{System.Environment.UserName}.json", optional: true);
            }

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
        /// Adds a custom data context the application.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        public PublicApiApplicationBuilder WithDynamoDataContext()
        {
            //_ = _builder.Services.AddCosmosBoundedDataContext<T>();
 //           _ = _builder.Services.AddDynamoDbDataContext();
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

            // if (_roleOptions.UseDefaultApiVersioning)
            // {
            //     _ = services.AddApiVersioning(
            //             options =>
            //             {
            //                 // reporting api versions will return the headers "api-supported-versions" and "api-deprecated-versions"
            //                 options.ReportApiVersions = true;
            //
            //                 options.AssumeDefaultVersionWhenUnspecified = true;
            //                 options.ApiVersionReader = ApiVersionReader.Combine(
            //                     new QueryStringApiVersionReader(),
            //                     new HeaderApiVersionReader("X-Api-Version")
            //                 );
            //             })
            //         .AddVersionedApiExplorer(
            //             options =>
            //             {
            //                 // add the versioned api explorer, which also adds IApiVersionDescriptionProvider service
            //                 // note: the specified format code will format the version as "'v'major[.minor][-status]"
            //                 options.GroupNameFormat = "'v'VVV";
            //
            //                 // note: this option is only necessary when versioning by url segment. the SubstitutionFormat
            //                 // can also be used to control the format of the API version in route templates
            //                 options.SubstituteApiVersionInUrl = true;
            //             });
            // }

            //             if (_roleOptions.UseDefaultObservability)
            //             {
            //                 _ = services.AddObservability(_entryPoint, options =>
            //                 {
            //                     if (_builder.Environment.IsDevelopment())
            //                     {
            //                         options.UseConsoleExporter = _roleOptions.EnableDevelopmentConsoleObservability;
            //                     }
            //
            //                     options.ConfigureMeterProvider = providerBuilder =>
            //                     {
            // #pragma warning disable IDE0058
            //                         providerBuilder
            //                             .SetExtendedResourceBuilder(_entryPoint)
            //                             .AddRuntimeInstrumentation()
            //                             .AddProcessInstrumentation()
            //                             .AddAspNetCoreInstrumentation()
            //                             .AddHttpClientInstrumentation();
            // #pragma warning restore IDE0058
            //
            //                         _roleOptions.ConfigureOpenTelemetryMetricsInternal?.Invoke(providerBuilder!);
            //                     };
            //
            //                     options.ConfigureTraceProvider = providerBuilder =>
            //                     {
            // #pragma warning disable IDE0058
            //                         providerBuilder
            //                             .AddHttpClientInstrumentation()
            //                             .AddAspNetCoreInstrumentation(o =>
            //                             {
            //                                 var ignoredPaths = new[] { "/ready", "/dapr/config", "/health" };
            //                                 o.Filter = context =>
            //                                 {
            //                                     return ignoredPaths.All(p =>
            //                                                !string.Equals(context.Request.Path, p,
            //                                                    StringComparison.OrdinalIgnoreCase)) &&
            //                                            !(context.Request.Path.HasValue &&
            //                                              context.Request.Path.Value.EndsWith(".js",
            //                                                  StringComparison.OrdinalIgnoreCase));
            //                                 };
            //
            //                                 o.EnrichWithHttpResponse = EnrichHttpResponseExtensions.EnrichWithUserClaims;
            //                                 o.RecordException = true;
            //                             })
            //                             .AddRepositoryEntityFrameworkCosmosDbInstrumentation()
            //                             .AddMessageQueueInstrumentation();
            // #pragma warning restore IDE0058
            //
            //                         _roleOptions.ConfigureOpenTelemetryTracesInternal?.Invoke(providerBuilder!);
            //                     };
            //                 });
            //             }

            // if (_roleOptions.UseDefaultAuthentication)
            // {
            //
            //     _ = services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            //         .AddDelineaIdentityAuthentication(jwtBearerOptions =>
            //         {
            //             jwtBearerOptions.CacheIdLookup = request =>
            //             {
            //                 var context = request.HttpContext.RequestServices
            //                 .GetRequiredService<MultiTenancy.Abstractions.TenantContext>();
            //                 return context.SecondaryId.ToString();
            //             };
            //         }, JwtBearerDefaults.AuthenticationScheme, false
            //         );
            // }
            //
            // if (_roleOptions.UseDefaultAuthorization)
            // {
            //     _ = services.AddAuthorization(options =>
            //     {
            //         // For now, any [Authorize] means 'must be authenticated', we can add claim checking if useful later
            //         var authorizationPolicyBuilder = new AuthorizationPolicyBuilder();
            //         _ = authorizationPolicyBuilder.RequireAuthenticatedUser();
            //
            //         options.DefaultPolicy = authorizationPolicyBuilder.Build();
            //     }).Add(containerBuilder =>
            //         containerBuilder.RegisterModule(new PermissionModule(_builder.Configuration.GetSection("Permission"))))
            //         .AddPermissionServiceAuthorization(o =>
            //         {
            //             o.Configuration = _builder.Configuration.GetSection("Permission");
            //             o.UsePrivateApi = true;
            //         });
            //
            // }

            // if (_roleOptions.UseDefaultAnonymousApiDocs)
            // {
            //     _ = services.AddAnonymousAccessApiDocs(c =>
            //     {
            //         c.OperationFilter<AuthorizeCheckOperationFilter>();
            //         c.OperationFilter<BadRequestResponseOperationFilter>();
            //         c.OperationFilter<FormatXmlCommentsOperationFilter>();
            //         c.OperationFilter<TenantHeaderOperationFilter>();
            //
            //         c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
            //         {
            //             In = ParameterLocation.Header,
            //             Description = "Please enter a valid token",
            //             Name = "Authorization",
            //             Type = SecuritySchemeType.Http,
            //             BearerFormat = "JWT",
            //             Scheme = "bearer"
            //         });
            //
            //         c.AddSecurityRequirement(new OpenApiSecurityRequirement()
            //     {
            //         {
            //             new OpenApiSecurityScheme
            //             {
            //                 Reference = new OpenApiReference
            //                 {
            //                     Type = ReferenceType.SecurityScheme,
            //                     Id = "Bearer"
            //                 }
            //             },
            //             Array.Empty<string>()
            //         }
            //     });
            //     });
            // }

            if (_roleOptions.UseDefaultResponseCaching)
            {
                _ = services.AddResponseCaching();
            }

            // if (_roleOptions.UseDefaultDataMapping)
            // {
            //
            //     _ = services.AddAutoMapper(cfg =>
            //         // For DTO-s use parameterized c-tor. For Domain objects use default c-tor and use the map
            //         cfg.DisableConstructorMapping(), _roleOptions.Assemblies);
            // }

            // if (_roleOptions.UseDefaultSerialization)
            // {
            //
            //     _ = services.Add(containerBuilder => containerBuilder.RegisterModule<SerializationModule>());
            // }

            // if (_roleOptions.UseDefaultHandlers)
            // {
            //     _ = services.AddHandlers(_roleOptions.Assemblies);
            // }

            // if (_roleOptions.UseDefaultMultiTenancy)
            // {
            //     _ = services.Add(containerBuilder =>
            //     {
            //         //_configuration.GetSection("MultiTenancy").Bind(_roleOptions)
            //
            //         _ = containerBuilder.RegisterModule(new MultiTenancyModule<HttpTenantContextProvider>(
            //             _builder.Configuration.GetSection("MultiTenancy")));
            //     });
            // }

            // if (_roleOptions.UseUserContext)
            // {
            //     _ = services.Add(containerBuilder =>
            //         _ = containerBuilder.RegisterModule(new UserContextModule<HttpUserContextProvider>()));
            // }

            // if (_roleOptions.UseDefaultFeatureFlags)
            // {
            //     _ = services.AddDelineaFeatureManagement(_builder.Configuration.GetSection("FeatureFlag"));
            // }

            // if (_roleOptions.UseDefaultHttpCaching)
            // {
            //     var clientConfig = _builder.Configuration.GetSection(DelineaApiClientConstants.ApiClientConfigurationSection)
            //         .Get<DelineaApiClientOptions>();
            //     _ = _builder.Services.AddDelineaApiClient(clientConfig!);
            // }

            // if (_roleOptions.UseDefaultMessaging)
            // {
            //     _ = services.AddMessaging(builderOptions =>
            //     {
            //         _ = builderOptions
            //             .UseExchangeNameMachineNameFormatter()
            //             .EnablePublish<IBackboneBus, BackboneBus>(_builder.Configuration.GetSection("PlatformBus"),
            //                 options =>
            //                 {
            //                     options.ConnectionName = _builder.Configuration[ConfigurationKeys.PlatformBusConnectionName] ??
            //                         Assembly.GetEntryAssembly()?.GetName().Name;
            //                     options.ExchangeName =
            //                         _builder.Configuration[ConfigurationKeys.PlatformBusExchangeName];
            //                     options.UseSymmetricKeyEncryption(
            //                         _builder.Configuration[ConfigurationKeys.PlatformBusSymmetricKey]!);
            //                     /*
            //                      * No connection pool, ConnectionString from configuration:
            //                      *
            //                      * builderOptions
            //                      *   .AddAmqpSupport<BackboneBus>()
            //                      *   .AddStaticConnectionStringProvider<BackboneBus>();
            //                      *
            //                      *
            //                      * No connection pool, ConnectionString via data boundary:
            //                      *
            //                      * builderOptions
            //                      *   .AddAmqpSupport<BackboneBus>()
            //                      *   .AddDataBoundaryConnectionStringProvider<BackboneBus>();
            //                      *
            //                      *
            //                      * Connection pool, ConnectionString from configuration:
            //                      *
            //                      * builderOptions
            //                      *   .AddAmqpWithConnectionPoolSupport<BackboneBus>()
            //                      *   .AddStaticConnectionStringProvider<BackboneBus>();
            //                      *
            //                      *
            //                      * Connection pool, ConnectionString via data boundary:
            //                      *
            //                      * builderOptions
            //                      *   .AddAmqpWithConnectionPoolSupport<BackboneBus>()
            //                      *   .AddStaticConnectionStringProvider<BackboneBus>();
            //                      */
            //                     _ = options
            //                         .AddAmqpWithConnectionPoolSupport<BackboneBus>();
            //                     _ = options.AddDataBoundaryConnectionStringProvider<BackboneBus>();
            //                     _ = options.UseTransientBus = _roleOptions.UseTransientPlatformBus;
            //                     _ = options.CommonBusBehaviourType = Enum.Parse<CommonBusBehaviorTypes>(_roleOptions.PlatformBusCommonBusBehaviourType.ToString());
            //                 })
            //             .EnablePublish<IInternalBus, InternalBus>(_builder.Configuration.GetSection("InternalBus"),
            //                 options =>
            //                 {
            //                     options.ConnectionName = _builder.Configuration[ConfigurationKeys.InternalBusConnectionName] ??
            //                         Assembly.GetEntryAssembly()?.GetName().Name;
            //                     options.ExchangeName =
            //                         _builder.Configuration[ConfigurationKeys.InternalBusExchangeName];
            //                     options.UseSymmetricKeyEncryption(
            //                         _builder.Configuration[ConfigurationKeys.InternalBusSymmetricKey]!);
            //                     _ = options
            //                         .AddAmqpWithConnectionPoolSupport<InternalBus>();
            //                     _ = options.AddDataBoundaryConnectionStringProvider<InternalBus>();
            //                     _ = options.UseTransientBus = _roleOptions.UseTransientInternalBus;
            //                     _ = options.CommonBusBehaviourType = Enum.Parse<CommonBusBehaviorTypes>(_roleOptions.InternalBusCommonBusBehaviourType.ToString());
            //                 });
            //     });
            // }

            // if (_roleOptions.UseDefaultHealthChecks)
            // {
            //     var healthChecksBuilder = services.AddHealthChecks();
            //     if (_roleOptions.HealthCheckOptions.UseDefaultApplicationStatusHealthChecks)
            //     {
            //         _ = healthChecksBuilder.AddApplicationStatusHealthChecks();
            //     }
            //
            //     if (_roleOptions.HealthCheckOptions.UseDefaultRabbitMqHealthChecks)
            //     {
            //         _ = healthChecksBuilder.AddRabbitMqHealthChecks(this.Configuration);
            //     }
            //
            //     if (_roleOptions.HealthCheckOptions.UseDefaultCosmosDbHealthChecks)
            //     {
            //         _ = healthChecksBuilder.AddCosmosDbHealthChecks(this.Configuration);
            //     }
            // }

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

            // if (_roleOptions.PostBuildOptions.UseHealthChecks)
            // {
            //
            //     var healthCheckOptions = new PlatformHealthCheckOptions();
            //     _roleOptions.PostBuildOptions.ConfigureHealthCheckOptions?.Invoke(healthCheckOptions);
            //
            //     _ = app
            //         .UseJsonHealthChecks(writeDetailedReport: this.Environment.IsDevelopment());
            //
            //     foreach (var tag in healthCheckOptions.Tags)
            //     {
            //         _ = app.UseJsonHealthChecks(tag.Path,
            //             options => options.Predicate = healthCheck => healthCheck.Tags.Contains(tag.TagName),
            //             writeDetailedReport: this.Environment.IsDevelopment());
            //     }
            //
            //     _ = app
            //         .UseReadinessChecks();
            // }

            // if (_roleOptions.PostBuildOptions.UseDefaultMiddleware)
            // {
            //     _ = app.UseMiddleware<MultiTenancyMiddleware>();
            //     _ = app.UseMiddleware<UnitOfWorkMiddleware>();
            //
            //     _ = app.UseMiddleware<UserContextMiddleware>();
            // }

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

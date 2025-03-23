using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using Autofac;
using Microsoft.Extensions.Hosting;
using Wedding.Common.Configuration;
using Wedding.PublicApi.Logic.DI;
using Wedding.PublicApi.Swagger;
using Wedding.Common.DI;
using System.Threading.Tasks;
using System;
using System.Text.Json;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration.Identity;

namespace Wedding.PublicApi
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<IConfiguration>(Configuration);
            services.AddWeddingAutomapper();
            services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });
            
            var auth0Config = Configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
            services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    options.Authority = $"{auth0Config.Authority}/";
                    options.Audience = $"{auth0Config.Audience}";
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = $"{auth0Config.Authority}/",
                        ValidAudience = $"{auth0Config.Audience}",
                    };

                    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
                    {
                        OnAuthenticationFailed = context =>
                        {
                            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                            return Task.CompletedTask;
                        },
                        OnTokenValidated = context =>
                        {
                            Console.WriteLine($"Token validated for: {context?.Principal?.Identity?.Name ?? "unknown principal identity"}");
                            return Task.CompletedTask;
                        }
                    };
                });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            services.AddEndpointsApiExplorer();
            services.AddAWSLambdaHosting(LambdaEventSource.RestApi);

            // services.AddLambdaRegistrations(typeof(Wedding.Lambdas.Admin.FamilyUnit.Create.RegistrationHook));
            // services.AddLambdaRegistrations(typeof(Wedding.Lambdas.Admin.FamilyUnit.Update.RegistrationHook));
            // services.AddLambdaRegistrations(typeof(Wedding.Lambdas.Admin.FamilyUnit.Delete.RegistrationHook));
            // services.AddLambdaRegistrations(typeof(Wedding.Lambdas.FamilyUnit.Get.RegistrationHook));

            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "Christephanie API", Version = "v1" });
                options.OperationFilter<AddResponsesOperationFilter>();
                options.OperationFilter<AuthorizeCheckOperationFilter>();
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter 'Bearer' [space] and then your valid token in the text input below.\n\nExample: \"Bearer eyJhbGciOiJIUz...\"",
                });
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
                options.DocInclusionPredicate((docName, apiDesc) =>
                {
                    // Exclude endpoints with an empty path (e.g., "/")
                    return !string.IsNullOrWhiteSpace(apiDesc.RelativePath);
                });

                options.MapType<bool>(() => new OpenApiSchema { Type = "boolean", Nullable = true });
#if LAMBDA
                options.CustomSchemaIds(type => type.FullName); // Avoid name collisions
#endif
            });
            // services.AddAuthentication("Bearer")
            //     .AddJwtBearer(options =>
            //     {
            //         options.TokenValidationParameters = new TokenValidationParameters
            //         {
            //             ValidateIssuer = true,
            //             ValidateAudience = true,
            //             ValidateLifetime = true,
            //             ValidateIssuerSigningKey = true,
            //             ValidIssuer = auth0Config.Authority,
            //             ValidAudience = auth0Config.Audience,
            //             IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(auth0Config.ClientSecret))
            //         };
            //     });
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseCors("AllowAll");

            if (app.ApplicationServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "API for Lambda v1");
                });
            }

            app.UseRouting();

            app.Use(async (context, next) =>
            {
                Console.WriteLine($"Middleware before authorization: {context.Request.Path}");
                await next.Invoke();
            });

            app.UseAuthentication(); // Add this first
            app.UseAuthorization();  // Add this second

            app.Use(async (context, next) =>
            {
                Console.WriteLine($"Middleware after authorization: {context.Request.Path}");
                await next.Invoke();
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/", async context =>
                {
                    await Task.Yield();
                    context.Response.Redirect("/swagger");
                });

                endpoints.MapControllers();
            });
        }

        // Configure Autofac container
        public void ConfigureContainer(ContainerBuilder builder)
        {
            var awsOptions = Configuration.GetAWSOptions();
            var uspsConfig = Configuration.GetSection(ConfigurationKeys.USPS).Get<UspsConfiguration>()!;
            var authProviderConfig = Configuration.GetSection(ConfigurationKeys.Authorization).Get<IdentityConfiguration>();
            var auth0Config = Configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;

            //--------------------------------------------
            // SKS, add new handlers here when testing!!!!
            //--------------------------------------------

            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Admin.FamilyUnit.Create.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Admin.FamilyUnit.Get.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Admin.FamilyUnit.Update.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Admin.FamilyUnit.Delete.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.FamilyUnit.Get.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.FamilyUnit.Update.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Validate.Address.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Validate.Phone.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Validate.Email.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Verify.Email.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Authorize.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Stats.Get.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.User.Find.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.User.Get.RegistrationHook));

            builder.RegisterModule(new LogicModule());
            builder.RegisterModule(new AwsModule(awsOptions));
            builder.RegisterModule(new UspsModule(uspsConfig));
            builder.RegisterModule(new AuthModule(authProviderConfig?.AuthProvider
                                                  ?? SupportedAuthorizationProvidersEnum.Internal, auth0Config!));

            // var app = builder.Build(options =>
            //     {
            //         options.UseDefaultHttpCaching = false;
            //         options.UseDefaultMessaging = false;
            //         options.UseDefaultObservability = false;
            //         options.UseDefaultHealthChecks = false;
            //         options.PostBuildOptions.UseHealthChecks = false;
            //         options.PostBuildOptions.UseEndpointControllerMappings = false;
            //         options.UseDefaultLogging = false;
            //     }
            // );
        }
    }
}
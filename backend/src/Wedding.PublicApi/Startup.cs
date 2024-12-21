using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using Autofac;
using Microsoft.Extensions.Hosting;
using Wedding.Common.Configuration;
using Wedding.Common.Web.Extensions;
using Wedding.Common.Web.Options;
using Wedding.PublicApi.Logic.DI;
using Wedding.PublicApi.Swagger;
using Autofac.Extensions.DependencyInjection;
using Wedding.Abstractions.Mapping;
using Wedding.Common.DI;
using FluentAssertions.Common;
using System.Threading.Tasks;
using System;
using Wedding.Abstractions.Enums;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.ThirdParty;
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
            services.AddWeddingAutomapper();
            services.AddControllers().AddJsonOptions(options =>
            {
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
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/", async context =>
                {
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

            //TODO: SKS, add new handlers here when testing!!!!

            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Admin.FamilyUnit.Create.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Admin.FamilyUnit.Update.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.Admin.FamilyUnit.Delete.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Wedding.Lambdas.FamilyUnit.Get.RegistrationHook));
            LambdaExtensions.LoadHandlers(builder, typeof(Lambdas.Validate.Address.RegistrationHook));

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
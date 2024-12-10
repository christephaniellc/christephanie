using System;
using System.Configuration;
using System.Data.Common;
using System.Diagnostics.CodeAnalysis;
using System.Net.Http;
using Autofac;
using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Cosmos.Storage.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Wedding.Common.Configuration;
using Wedding.Common.Web.Extensions;

namespace Wedding.Common.Web.DI
{
    /// <summary>
    /// Data module for registering data access objects/repositories.
    /// </summary>
    /// <seealso cref="Autofac.Module" />
    [ExcludeFromCodeCoverage]
    public class DataModule<TDbContext> : Module where TDbContext : DbContext
    {
        /// <summary>
        /// The default connection mode
        /// </summary>
        public const ConnectionMode DefaultConnectionMode = ConnectionMode.Direct;

        /// <summary>
        /// The default whether to enable open telemetry
        /// </summary>
        public const bool DefaultEnableOpenTelemetry = true;

        /// <summary>
        /// The default whether to enable sensitive data logging
        /// </summary>
        public const bool DefaultEnableSensitiveDataLogging = false;

        /// <summary>
        /// The default of whether to use the runtime data boundary.
        /// Intended for flows that don't have a tenant context to determine the data boundary.
        /// </summary>
        public const bool DefaultUseRuntimeDataBoundary = false;

        /// <summary>
        /// The default log level for Entity Framework diagnostic logs.
        /// </summary>
        public const LogLevel DefaultLogLevel = LogLevel.None;

        /// <summary>
        /// The default log action for Entity Framework diagnostic logs.
        /// </summary>
        public static readonly Action<string> DefaultLogAction = Console.Out.WriteLine;
        private readonly ConnectionMode _connectionMode;
        private readonly bool _enableOpenTelemetry;
        private readonly bool _enableSensitiveDataLogging;
        private readonly bool _useRuntimeDataBoundary;
        private readonly LogLevel _logLevel;
        private Action<string> _logAction;

        /// <summary>
        /// Initializes a new instance of the <see cref="DataModule{TDbContext}"/> class.
        /// </summary>
        /// <param name="connectionMode">
        /// The connection mode. At the moment if <paramref name="enableOpenTelemetry"/> is <c>true</c>,
        /// the value of <paramref name="connectionMode"/> will be coerced to <c>ConnectionMode.Gateway</c>.
        /// </param>
        /// <param name="enableOpenTelemetry">
        /// If set to <see langword="true" /> enables OpenTelemetry for Entity Framework and Cosmos DB client.
        /// </param>
        /// <param name="enableSensitiveDataLogging">
        /// If set to <see langword="true" /> enables logging of sensitive data. Use only in development mode.
        /// </param>
        /// <param name="useRuntimeDataBoundary">
        /// If true, use the run time cluster information data boundary
        /// </param>
        /// <param name="logLevel">The Entity Framework Core diagnostic log level.</param>
        /// <param name="logAction">
        /// The Entity Framework Core diagnostic logging method. If <c>null</c>, defaults to <c>Console.Out.WriteLine</c>.
        /// </param>
        public DataModule(
            ConnectionMode connectionMode = DefaultConnectionMode,
            bool enableOpenTelemetry = DefaultEnableOpenTelemetry,
            bool enableSensitiveDataLogging = DefaultEnableSensitiveDataLogging,
            bool useRuntimeDataBoundary = DefaultUseRuntimeDataBoundary,
            LogLevel logLevel = DefaultLogLevel,
            Action<string>? logAction = null)
        {
            _connectionMode = enableOpenTelemetry ? ConnectionMode.Gateway : connectionMode;
            _enableOpenTelemetry = enableOpenTelemetry;
            _enableSensitiveDataLogging = enableSensitiveDataLogging;
            _useRuntimeDataBoundary = useRuntimeDataBoundary;
            _logLevel = logLevel;
            _logAction = logAction ?? DefaultLogAction;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DataModule{TDbContext}"/> class with default values
        /// </summary>
        public DataModule() : this(DefaultConnectionMode, DefaultEnableOpenTelemetry, DefaultEnableSensitiveDataLogging, DefaultUseRuntimeDataBoundary, DefaultLogLevel, DefaultLogAction)
        {
        }

        /// <inheritdoc />
        protected override void Load(ContainerBuilder builder)
        {
            _ = builder.Register(
                context =>
                {
                    var configuration = context.Resolve<IConfiguration>();

                    string? connectionString = null;
                    string? dataBoundary = null;

                    var logger = context.ResolveOptional<ILoggerFactory>()?.CreateLogger<TDbContext>();

                    // if (_useRuntimeDataBoundary)
                    // {
                    //     dataBoundary = configuration[ConfigurationKeys.RuntimeDataBoundary];
                    //     logger?.LogTrace("DataBoundary retrieved from cluster information is {DataBoundary}", dataBoundary);
                    // }
                    //
                    // // try to get the connection string for the boundary
                    // if (string.IsNullOrWhiteSpace(dataBoundary))
                    // {
                    //     dataBoundary = configuration[ConfigurationKeys.DataBoundaryKey];
                    //     logger?.LogTrace("DataBoundary retrieved from configuration information is {DataBoundary}", dataBoundary);
                    // }
                    //
                    // if (!string.IsNullOrWhiteSpace(dataBoundary))
                    // {
                    //     connectionString = configuration[string.Format(CultureInfo.InvariantCulture, ConfigurationKeys.DataBaseConnectionBoundaryFormatString, dataBoundary)];
                    // }

                    // if no boundary based connection string - get the fall back connection string
                    if (string.IsNullOrWhiteSpace(connectionString))
                    {
                        connectionString = configuration[ConfigurationKeys.DatabaseConnectionString];
                        logger?.LogWarning("DataBoundary is {DataBoundary}, connection string not found, resolving via default connection string for {DefaultDbStringKey}", dataBoundary, ConfigurationKeys.DatabaseConnectionString);
                    }

                    // if still no DB connection string - throw exception
                    if (string.IsNullOrWhiteSpace(connectionString))
                    {
                        throw new ConfigurationErrorsException("Could not find a database connection string setting in the configuration.");
                    }

                    // parse the connection string
                    var dbcs = new DbConnectionStringBuilder()
                    {
                        ConnectionString = connectionString
                    };

                    // validate the DB connection string parts for CosmosDB
                    var databaseName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                        ? configuration[ConfigurationKeys.DevDatabaseOverride] ?? dbcs.GetDatabaseName()
                        : dbcs.GetDatabaseName();
                    if (string.IsNullOrWhiteSpace(databaseName))
                    {
                        throw new ConfigurationErrorsException("Could not find the database name in the database connection string.");
                    }

                    var accountEndpoint = dbcs.GetAccountEndpoint();

                    if (string.IsNullOrWhiteSpace(accountEndpoint))
                    {
                        throw new ConfigurationErrorsException("Could not find the database AccountEndpoint in the database connection string.");
                    }

                    var accountKey = dbcs.GetAccountKey();

                    if (string.IsNullOrWhiteSpace(accountKey))
                    {
                        throw new ConfigurationErrorsException("Could not find the database AccountKey in the database connection string.");
                    }

                    if (bool.TryParse(configuration[ConfigurationKeys.DevEfDiagnostics], out var devEfDiagnostics) && devEfDiagnostics)
                    {
                        if (logger is not null)
                        {
                            _logAction = s => logger.Log(_logLevel, "{Message}", s);
                        }
                    }

                    var httpClientFactory = context.Resolve<IHttpClientFactory>();
                    var contextOptionsBuilder = new DbContextOptionsBuilder<TDbContext>()
                        .UseCosmos(
                            accountEndpoint,
                            accountKey,
                            databaseName,
                            options =>
                            {
                                _ = options.ConnectionMode(_connectionMode);
                                if (_enableOpenTelemetry)
                                {
                                    _ = options.HttpClientFactory(httpClientFactory.CreateCosmosHttpClient);
                                }

#pragma warning disable EF1001 // Internal EF Core API usage.
                                _ = options.ExecutionStrategy(d => new CosmosExecutionStrategy(d));
#pragma warning restore EF1001 // Internal EF Core API usage.
                            })
                        .LogTo(_logAction, _logLevel)
                        .EnableSensitiveDataLogging(_enableSensitiveDataLogging);
                    return contextOptionsBuilder.Options;
                })
                .As<DbContextOptions<TDbContext>>()
                .InstancePerLifetimeScope();

            _ = builder
                .RegisterType<TDbContext>()
                .AsImplementedInterfaces()
                .AsSelf()
                .InstancePerLifetimeScope();
        }
    }

}

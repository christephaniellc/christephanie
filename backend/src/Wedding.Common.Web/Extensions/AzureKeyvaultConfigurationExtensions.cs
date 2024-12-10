using System;
using Azure.Core;
using Azure.Identity;
using Microsoft.Extensions.Configuration;

namespace Wedding.Common.Web.Extensions
{
    public static class AzureKeyvaultConfigurationExtensions
    {
        public static IConfigurationBuilder AddAzureKeyVaultWithDefaultCredentials(
            this IConfigurationBuilder configurationBuilder,
            string vaultUrls,
            Action<DefaultAzureCredentialOptions>? configurationAction = null)
        {
            string[] vaultUrls1 = vaultUrls.Split(',');
            configurationBuilder.AddAzureKeyVaultWithDefaultCredentials(vaultUrls1, configurationAction);
            return configurationBuilder;
        }

        public static IConfigurationBuilder AddAzureKeyVaultWithDefaultCredentials(
            this IConfigurationBuilder configurationBuilder,
            string[] vaultUrls,
            Action<DefaultAzureCredentialOptions>? configurationAction = null)
        {
            foreach (string vaultUrl in vaultUrls)
                configurationBuilder.AddAzureKeyVaultWithDefaultCredentials(new Uri(vaultUrl), configurationAction);
            return configurationBuilder;
        }

        public static IConfigurationBuilder AddAzureKeyVaultWithDefaultCredentials(
            this IConfigurationBuilder configurationBuilder,
            Uri vaultUri,
            Action<DefaultAzureCredentialOptions>? configurationAction = null)
        {
            DefaultAzureCredentialOptions options = new DefaultAzureCredentialOptions()
            {
                ExcludeAzurePowerShellCredential = true,
                ExcludeManagedIdentityCredential = true,
                ExcludeSharedTokenCacheCredential = true,
                ExcludeEnvironmentCredential = true,
                ExcludeInteractiveBrowserCredential = true
            };
            if (configurationAction != null)
                configurationAction(options);

            // TODO: SKS uncomment
            //Microsoft.Extensions.Configuration.AzureKeyVaultConfigurationExtensions.AddAzureKeyVault(configurationBuilder, vaultUri.ToString(), (TokenCredential)new DefaultAzureCredential(options));
            return configurationBuilder;
        }
    }
}

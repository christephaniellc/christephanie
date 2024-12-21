using Wedding.Abstractions.Enums;

namespace Wedding.Common.Configuration.Identity
{
    public sealed class IdentityConfiguration
    {
        public SupportedAuthorizationProvidersEnum AuthProvider { get; set; }
    }
}

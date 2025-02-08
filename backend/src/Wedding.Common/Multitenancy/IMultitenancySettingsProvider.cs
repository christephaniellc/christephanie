namespace Wedding.Common.Multitenancy
{
    public interface IMultitenancySettingsProvider
    {
        string GetMappedAudience(string origin);
        string GetMappedTableName(string tenantId, bool rateLimit = false);
    }
}

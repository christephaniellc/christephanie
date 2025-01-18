namespace Wedding.Common.Multitenancy
{
    public interface IMultitenancySettingsProvider
    {
        string GetAudience(string origin);
        string GetTableName(string tenantId);
    }
}

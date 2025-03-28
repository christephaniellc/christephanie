using Wedding.Abstractions.Enums;

namespace Wedding.Common.Multitenancy
{
    public interface IMultitenancySettingsProvider
    {
        string GetMappedAudience(string origin);
        string GetMappedTableName(string tenantId, DatabaseTableEnum table = DatabaseTableEnum.GuestData);
    }
}

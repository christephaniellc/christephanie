using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Dtos;
using System.Collections.Generic;

namespace Wedding.Common.Helpers.AWS
{
    public interface IDynamoDBProvider
    {
        Task<bool> CheckRateLimitAsync(string audience, string ipAddress, string route, int rateLimit = 3, double rateLimitPerSeconds = 1.0, CancellationToken cancellationToken = default);
        Task<WeddingEntity?> LoadFamilyUnitOnlyAsync(string audience, string invitationCode, CancellationToken cancellationToken = default);
        Task<WeddingEntity?> LoadGuestByGuestIdAsync(string audience, string invitationCode, string guestId, CancellationToken cancellationToken = default);
        Task<List<WeddingEntity>?> QueryAsync(string audience, string invitationCode, CancellationToken cancellationToken = default);
        Task<List<WeddingEntity>?> QueryByGuestIdIndex(string audience, string guestId, CancellationToken cancellationToken = default);
        Task<List<WeddingEntity>?> FromQueryAsync(string audience, string invitationCode, CancellationToken cancellationToken = default);
        Task<FamilyUnitDto?> GetFamilyUnitAsync(string audience, string invitationCode, CancellationToken cancellationToken = default);
        Task<List<FamilyUnitDto>?> GetFamilyUnitsAsync(string audience, CancellationToken cancellationToken = default);
        Task SaveAsync(string audience, WeddingEntity entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(string audience, string invitationCode, string sortKey, CancellationToken cancellationToken = default);
    }
}

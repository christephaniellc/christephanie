using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Dtos;
using System.Collections.Generic;

namespace Wedding.Common.Helpers.AWS
{
    public interface IDynamoDBProvider
    {
        Task<WeddingEntity?> LoadFamilyUnitOnlyAsync(string invitationCode, CancellationToken cancellationToken = default);
        Task<WeddingEntity?> LoadGuestByGuestIdAsync(string invitationCode, string guestId, CancellationToken cancellationToken = default);
        Task<List<WeddingEntity>?> QueryAsync(string invitationCode, CancellationToken cancellationToken = default);
        Task<List<WeddingEntity>?> QueryByGuestIdIndex(string guestId, CancellationToken cancellationToken = default);
        Task<List<WeddingEntity>?> FromQueryAsync(string invitationCode, CancellationToken cancellationToken = default);
        Task<FamilyUnitDto?> GetFamilyUnitAsync(string invitationCode, CancellationToken cancellationToken = default);
        Task SaveAsync(WeddingEntity entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(string invitationCode, string sortKey, CancellationToken cancellationToken = default);
    }
}

using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Dtos;

namespace Wedding.Common.Helpers.AWS
{
    public interface IDynamoDBProvider
    {
        Task<WeddingEntity?> LoadFamilyUnitOnlyAsync(string invitationCode, CancellationToken cancellationToken = default);
        Task<WeddingEntity?> LoadGuestByGuestIdAsync(string invitationCode, string guestId, CancellationToken cancellationToken = default);
        Task<FamilyUnitDto?> GetFamilyUnitAsync(string invitationCode, CancellationToken cancellationToken = default);
        Task SaveAsync(WeddingEntity entity, CancellationToken cancellationToken = default);
    }
}

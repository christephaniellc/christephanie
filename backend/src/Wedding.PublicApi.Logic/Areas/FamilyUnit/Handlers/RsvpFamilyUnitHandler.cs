using System.Threading;
using System.Threading.Tasks;
using Wedding.Abstractions;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Handlers
{
    public class RsvpFamilyUnitHandler : IAsyncCommandHandler<RsvpFamilyUnitCommand, FamilyUnitDto>
    {
        public Task<FamilyUnitDto> ExecuteAsync(RsvpFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            throw new System.NotImplementedException();
        }
    }
}

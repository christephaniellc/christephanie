using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands
{
    public record UpdateFamilyUnitCommand(string RsvpCode, FamilyUnitDto 
        FamilyUnit) : IWeddingCommand;
}

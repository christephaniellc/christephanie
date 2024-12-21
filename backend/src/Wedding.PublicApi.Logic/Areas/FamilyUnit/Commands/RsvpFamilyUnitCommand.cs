using Wedding.Abstractions;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands
{
    public record RsvpFamilyUnitCommand(FamilyUnitDto
        FamilyUnit) : IWeddingCommand;
}

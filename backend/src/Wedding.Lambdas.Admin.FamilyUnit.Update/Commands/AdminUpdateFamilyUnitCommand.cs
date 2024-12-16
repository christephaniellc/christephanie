using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Commands
{
    public record UpdateFamilyUnitCommand(FamilyUnitDto 
        FamilyUnit) : IWeddingCommand;
}

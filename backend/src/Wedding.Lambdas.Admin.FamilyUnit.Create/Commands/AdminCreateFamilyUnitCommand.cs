using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Commands
{
    public record AdminCreateFamilyUnitCommand(
        FamilyUnitDto FamilyUnit) : IWeddingCommand;
}

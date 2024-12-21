using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Commands
{
    public record CreateFamilyUnitCommand(
        FamilyUnitDto FamilyUnit) : IWeddingCommand;
}

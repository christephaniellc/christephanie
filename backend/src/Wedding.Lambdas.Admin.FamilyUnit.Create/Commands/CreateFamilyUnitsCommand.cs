using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Commands
{
    public record CreateFamilyUnitsCommand(
        List<FamilyUnitDto> FamilyUnits) : IWeddingCommand;
}

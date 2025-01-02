using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Commands
{
    public record AdminCreateFamilyUnitsCommand(
        List<FamilyUnitDto> FamilyUnits) : IWeddingCommand;
}

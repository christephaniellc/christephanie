using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Commands
{
    public record AdminCreateFamilyUnitsCommand(
        List<FamilyUnitDto> FamilyUnits, AuthContext AuthContext) : IWeddingCommand;
}

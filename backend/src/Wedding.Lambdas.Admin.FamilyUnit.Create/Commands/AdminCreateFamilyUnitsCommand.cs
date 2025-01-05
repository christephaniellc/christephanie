using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Commands
{
    public record AdminCreateFamilyUnitsCommand(
        List<FamilyUnitDto> FamilyUnits, List<RoleEnum> CurrentUserRoles) : IWeddingCommand;
}

using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Commands
{
    public record AdminUpdateFamilyUnitCommand(
        FamilyUnitDto FamilyUnit,
        List<RoleEnum> UserRoles) : IWeddingCommand;
}

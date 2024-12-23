using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Commands
{
    public record UpdateFamilyUnitCommand(
        FamilyUnitDto FamilyUnit,
        string Auth0Id,
        string InvitationCode,
        List<RoleEnum> Roles) : IWeddingCommand;
}

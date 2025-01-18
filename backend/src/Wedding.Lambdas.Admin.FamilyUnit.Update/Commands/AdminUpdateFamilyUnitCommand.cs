using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Commands
{
    public record AdminUpdateFamilyUnitCommand(
        FamilyUnitDto FamilyUnit, AuthContext AuthContext) : IWeddingCommand;
}

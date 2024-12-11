using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands
{
    public record AuthorizationQuery(
        string Identity = default, RoleEnum role = RoleEnum.Admin) : IWeddingQuery;
}

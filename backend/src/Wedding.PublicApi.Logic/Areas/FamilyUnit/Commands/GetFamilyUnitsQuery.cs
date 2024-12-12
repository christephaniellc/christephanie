using Wedding.Common.Dispatchers;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands
{
    public record GetFamilyUnitsQuery(
        bool? Interested = default) : IWeddingQuery;
}

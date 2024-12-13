using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.FamilyUnit.Get.Commands
{
    /// <summary>
    /// Class GetFamilyUnitQuery used to get a FamilyUnit.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="Id">The Id of the FamilyUnit</param>
    /// <param name="Name">The name of the FamilyUnit</param>
    public record GetFamilyUnitQuery(
        string RsvpCode = default) : IWeddingQuery;
}

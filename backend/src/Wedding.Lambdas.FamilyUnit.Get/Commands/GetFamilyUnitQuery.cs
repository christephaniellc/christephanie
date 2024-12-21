using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.FamilyUnit.Get.Commands
{
    /// <summary>
    /// Class GetFamilyUnitQuery used to get a FamilyUnit.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="InvitationCode">The RsvpCode of the FamilyUnit</param>
    public record GetFamilyUnitQuery(
        string InvitationCode, string FirstName) : IWeddingQuery;
}

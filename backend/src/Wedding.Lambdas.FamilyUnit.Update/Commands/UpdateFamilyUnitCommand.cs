using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.FamilyUnit.Update.Commands
{
    /// <summary>
    /// Class UpdateFamilyUnitCommand used to get a FamilyUnit.
    /// Implements the <see cref="IWeddingCommand" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="FamilyUnit">The FamilyUnit</param>
    public record UpdateFamilyUnitCommand(
        FamilyUnitDto FamilyUnit, bool AddressesConfirmed = false) : IWeddingCommand;
}

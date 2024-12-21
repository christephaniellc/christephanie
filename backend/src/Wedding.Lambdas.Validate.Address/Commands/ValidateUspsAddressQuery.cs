using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Validate.Address.Commands
{
    public record ValidateUspsAddressQuery(
        AddressDto EnteredAddress) : IWeddingQuery;
}

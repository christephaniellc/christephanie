using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;

namespace Wedding.Common.ThirdParty
{
    public interface IUspsMailingAddressValidationProvider
    {
        Task<AddressDto> ValidateAddress(AddressDto address);
    }
}

using System.Collections.Generic;

namespace Wedding.Abstractions.Dtos.USPS
{
    /// <summary>
    /// https://developer.usps.com/addressesv3#tag/Resources/operation/get-address
    /// </summary>
    public class UspsAddressDto
    {
        public string Firm { get; set; }
        public AddressDto Address { get; set; }
        public UspsAdditionalInfoDto AdditionalInfo { get; set; }
        public List<UspsCorrectionDto> Corrections { get; set; }
        public List<UspsMatchDto> Matches { get; set; }
        public List<string> Warnings { get; set; }
    }
}

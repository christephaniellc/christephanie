namespace Wedding.Abstractions.Dtos
{
    public class AddressDto
    {
        public string StreetAddress { get; set; }
        public string? StreetAddressAbbreviation { get; set; }
        public string? SecondaryAddress { get; set; }
        public string City { get; set; }
        public string? CityAbbreviation { get; set; }
        public string State { get; set; }
        public string? PostalCode { get; set; }
        public string? Province { get; set; }
        public string ZIPCode { get; set; }
        public string? ZIPPlus4 { get; set; }
        public string? Urbanization { get; set; }
        public string? Country { get; set; }
        public string? CountryISOCode { get; set; }
    }
}

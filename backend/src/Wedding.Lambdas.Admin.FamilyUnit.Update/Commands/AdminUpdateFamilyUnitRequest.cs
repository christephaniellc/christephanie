using Wedding.Abstractions.Dtos;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Commands
{
    public class AdminUpdateFamilyUnitRequest
    {
        public AddressDto? MailingAddress { get; set; }
    }
}

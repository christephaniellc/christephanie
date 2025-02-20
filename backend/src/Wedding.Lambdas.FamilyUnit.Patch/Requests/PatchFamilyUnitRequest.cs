using Wedding.Abstractions.Dtos;

namespace Wedding.Lambdas.FamilyUnit.Patch.Requests
{
    public class PatchFamilyUnitRequest
    {
        public AddressDto? MailingAddress { get; set; }
        public string? InvitationResponseNotes { get; set; }
    }
}

using System.Linq;
using FluentValidation;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation
{
    /// <summary>
    /// Validator for RsvpFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{RsvpFamilyUnitCommand}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{RsvpFamilyUnitCommand}" />
    internal class FamilyUnitInvitationResponseCommandValidator : AbstractValidator<RsvpFamilyUnitCommand>, IValidate<RsvpFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public FamilyUnitInvitationResponseCommandValidator()
        {
            RuleFor(cmd => cmd.FamilyUnit).SetValidator(new UpdateFamilyUnitDtoValidator());
            RuleFor(cmd => cmd.FamilyUnit.MailingAddress)
                .NotEmpty()
                .When(cmd => cmd.FamilyUnit.Guests != null 
                             && cmd.FamilyUnit.Guests.Any(guest => guest.Rsvp != null 
                                                          && guest.Rsvp.InvitationResponse == InvitationResponseEnum.Interested))
                .WithMessage("Mailing address cannot be empty when there are interested guests.")
                ;
            RuleFor(cmd => cmd.FamilyUnit.MailingAddress)
                .SetValidator(new MailingAddressValidator()!)
                .When(cmd => !string.IsNullOrEmpty(cmd.FamilyUnit.MailingAddress));
            RuleForEach(cmd => cmd.FamilyUnit.AdditionalAddresses)
                .SetValidator(new MailingAddressValidator())
                .When(cmd => cmd.FamilyUnit.AdditionalAddresses != null && cmd.FamilyUnit.AdditionalAddresses.Any())
                ;
    }

        public void IsValid(RsvpFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}

using FluentValidation;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation;
using Wedding.PublicApi.Logic.Areas.Guest.Commands;

namespace Wedding.PublicApi.Logic.Areas.Guest.Validation
{
    /// <summary>
    /// Validator for RsvpGuestCommand.
    /// Implements the <see cref="AbstractValidator{RsvpGuestCommand}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{RsvpGuestCommand}" />
    internal class RsvpGuestCommandValidator : AbstractValidator<RsvpGuestCommand>, IValidate<RsvpGuestCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public RsvpGuestCommandValidator()
        {
            RuleFor(cmd => cmd.Guest).SetValidator(new GuestDtoValidator());
            
            // TODO: SKS, formal RSVP response validation here
            //RuleFor(cmd => cmd.Guest.Rsvp)
        }

        public void IsValid(RsvpGuestCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}

using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Validate.InvitationCode.Commands;

namespace Wedding.Lambdas.Validate.InvitationCode.Validation
{
    /// <summary>
    /// Validator for GetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{ GetFamilyUnitQuery }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetGuestByInvitationCodeQueryValidator : AbstractValidator<GetGuestByInvitationCodeQuery>, IValidate<GetGuestByInvitationCodeQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetGuestByInvitationCodeQueryValidator" /> class.
        /// </summary>
        public GetGuestByInvitationCodeQueryValidator()
        {
            RuleFor(query => query.InvitationCode)
                .NotNull()
                .NotEmpty()
                .SetValidator(new RsvpCodeValidator());
            RuleFor(query => query.FirstName)
                .NotEmpty()
                .WithMessage("First name cannot be empty");
        }

        public void IsValid(GetGuestByInvitationCodeQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}

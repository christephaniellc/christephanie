using System.Linq;
using FluentValidation;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class AuthContextValidator : AbstractValidator<AuthContext>, IValidate<AuthContext>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AuthContextValidator" /> class.
        /// </summary>
        public AuthContextValidator(bool needsAdmin)
        {
            RuleFor(cmd => cmd.Audience)
                .NotEmpty()
                .WithMessage("Audience not set.");
            RuleFor(cmd => cmd.GuestId)
                .NotEmpty()
                .SetValidator(new GuidValidator());
            RuleFor(cmd => cmd.InvitationCode)
                .NotEmpty()
                .SetValidator(new InvitationCodeValidator());
            RuleFor(cmd => cmd.ParseRoles())
                .NotNull()
                .NotEmpty()
                .Must(roles => roles.Any())
                .WithMessage("Roles list must not be empty.");

            if (needsAdmin)
            {
                RuleFor(cmd => cmd.ParseRoles())
                    .NotNull()
                    .SetValidator(new AdminValidator());
            }
        }
        public void IsValid(AuthContext obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}

using System.Collections.Generic;
using FluentValidation;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class AdminValidator : AbstractValidator<List<RoleEnum>?>, IValidate<List<RoleEnum>?>
    {
        public AdminValidator()
        {
            RuleFor(roles => roles)
                .NotNull()
                .WithMessage("No roles found.")
                .Must(roles => BeAnAdmin(roles))
                .WithMessage("No admin permissions.");
        }

        private bool BeAnAdmin(List<RoleEnum>? currentUserRoles)
        {
            return currentUserRoles?.Contains(RoleEnum.Admin) ?? false;
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(List<RoleEnum>? obj, object? _ = null)
            => this!.ValidateAndThrow(obj);
    }
}

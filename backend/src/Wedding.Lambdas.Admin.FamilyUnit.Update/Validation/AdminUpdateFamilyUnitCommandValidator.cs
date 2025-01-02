using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text.Json;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Validation
{
    /// <summary>
    /// Validator for AdminUpdateFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{AdminUpdateFamilyUnitCommand}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{AdminUpdateFamilyUnitCommand}" />
    internal class AdminUpdateFamilyUnitCommandValidator : AbstractValidator<AdminUpdateFamilyUnitCommand>, IValidate<AdminUpdateFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminUpdateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public AdminUpdateFamilyUnitCommandValidator()
        {
            RuleFor(query => query.UserRoles)
                .NotNull()
                .NotEmpty()
                .Must(userRoles => HavePermissionToUpdate(userRoles));
            RuleFor(cmd => cmd.FamilyUnit)
                .NotNull()
                .NotEmpty()
                .SetValidator(new UpdateFamilyUnitDtoValidator());
        }

        public void IsValid(AdminUpdateFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);


        public bool UserIsAdmin(List<RoleEnum> userRoles)
        {
            return userRoles.Contains(RoleEnum.Admin);
        }

        public bool HavePermissionToUpdate(List<RoleEnum> userRoles)
        {
            if (!UserIsAdmin(userRoles))
            {
                Console.WriteLine($"Family unit update permission error. User roles: {JsonSerializer.Serialize(userRoles)}. ");
                return false;
                //throw new UnauthorizedAccessException("Family unit update exception: Invitation code mismatch.");
            }

            return true;
        }
    }
}

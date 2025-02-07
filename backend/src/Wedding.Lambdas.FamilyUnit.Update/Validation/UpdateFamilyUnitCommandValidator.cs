using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.FamilyUnit.Update.Commands;

namespace Wedding.Lambdas.FamilyUnit.Update.Validation
{
    /// <summary>
    /// Validator for UpdateFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{ UpdateFamilyUnitCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class UpdateFamilyUnitCommandValidator : AbstractValidator<UpdateFamilyUnitCommand>, IValidate<UpdateFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public UpdateFamilyUnitCommandValidator()
        {
            RuleFor(query => query.FamilyUnit)
                .NotNull()
                .NotEmpty()
                .SetValidator(new UpdateFamilyUnitDtoValidator());
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
            RuleFor(query => query)
                .NotNull()
                .NotEmpty()
                .Must(query => 
                    HavePermissionToUpdate(
                        query.FamilyUnit,
                        query.AuthContext));
        }

        public void IsValid(UpdateFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);

        public bool UserIsAdmin(List<RoleEnum> userRoles)
        {
            return userRoles.Contains(RoleEnum.Admin);
        }

        public bool HavePermissionToUpdate(FamilyUnitDto? familyUnit, AuthContext? authContext)
        {
            if (familyUnit == null || authContext == null)
            {
                return false;
            }
            var userRoles = authContext.ParseRoles();
            if (familyUnit.InvitationCode.ToUpper() != authContext.InvitationCode.ToUpper() && !UserIsAdmin(userRoles))
            {
                Console.WriteLine($"Permission error. User invitation code: {authContext.InvitationCode}, expected invitation code: {familyUnit.InvitationCode}");
                return false;
            }
            if (!familyUnit.Guests!.Any(g => g.GuestId.ToUpper().Equals(authContext.GuestId.ToUpper())) && !UserIsAdmin(userRoles))
            {
                Console.WriteLine($"Permission error. Guest not found: {authContext.GuestId}, in family unit: {familyUnit.InvitationCode}");
                return false;
            }

            return true;
        }
    }
}

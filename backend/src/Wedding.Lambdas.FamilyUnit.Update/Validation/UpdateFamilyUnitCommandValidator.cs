using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
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
            RuleFor(query => query)
                .NotNull()
                .NotEmpty()
                .Must(query => 
                    HavePermissionToUpdate(
                        query.FamilyUnit, 
                        query.UserInvitationCode, 
                        query.UserGuestId, 
                        query.UserRoles));
            RuleFor(query => query.FamilyUnit)
                .NotNull()
                .NotEmpty()
                .SetValidator(new UpdateFamilyUnitDtoValidator());
        }

        public void IsValid(UpdateFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);

        public bool UserIsAdmin(List<RoleEnum> userRoles)
        {
            return userRoles.Contains(RoleEnum.Admin);
        }

        public bool HavePermissionToUpdate(FamilyUnitDto familyUnit, string userInvitationCode, string userGuestId, List<RoleEnum> userRoles)
        {
            if (familyUnit.InvitationCode.ToUpper() != userInvitationCode.ToUpper() && !UserIsAdmin(userRoles))
            {
                Console.WriteLine($"Permission error. User invitation code: {userInvitationCode}, expected invitation code: {familyUnit.InvitationCode}");
                return false;
                //throw new UnauthorizedAccessException("Family unit update exception: Invitation code mismatch.");
            }
            if (!familyUnit.Guests.Any(g => g.GuestId.ToUpper().Equals(userGuestId.ToUpper())) && !UserIsAdmin(userRoles))
            {
                Console.WriteLine($"Permission error. Guest not found: {userGuestId}, in family unit: {familyUnit.InvitationCode}");
                return false;
                // throw new UnauthorizedAccessException("Family unit update exception: Guest permission error.");
            }

            return true;
        }
    }
}

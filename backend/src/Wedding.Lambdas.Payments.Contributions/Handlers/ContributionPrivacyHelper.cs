using System;
using System.Collections.Generic;
using System.Linq;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation.Utility;

namespace Wedding.Lambdas.Payments.Contributions.Handlers
{
    public static class ContributionPrivacyHelper
    {
        public static void ApplyPrivacyMask(List<ContributionDto> contributions, string authContextRoles)
        {
            var roles = authContextRoles
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(role => Enum.Parse<RoleEnum>(role.Trim(), ignoreCase: true))
                .ToList();
            var authedAsAdmin = new AdminValidator().Validate(roles);

            foreach (var dto in contributions)
            {
                if (dto.IsAnonymous)
                {
                    if (authedAsAdmin.IsValid)
                    {
                        dto.GuestName = $"{dto.GuestName} (Anonymous)";
                        // GuestId remains
                    }
                    else
                    {
                        dto.GuestName = "Anonymous";
                        dto.GuestId = string.Empty;
                    }
                }
            }
        }
    }
}

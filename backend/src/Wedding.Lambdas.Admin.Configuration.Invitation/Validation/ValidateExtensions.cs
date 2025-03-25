using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.Configuration.Invitation.Commands;
using Wedding.Lambdas.Admin.Configuration.Invitation.Validation;

namespace Wedding.Lambdas.Admin.InvitationDesign.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this AdminGetPhotoConfigurationsQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<AdminGetPhotoConfigurationsQuery, AdminGetPhotoConfigurationsQueryValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this AdminGetPhotoConfigurationQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<AdminGetPhotoConfigurationQuery, AdminGetPhotoConfigurationQueryValidator>(obj, context);
        
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this AdminSavePhotoConfigurationCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<AdminSavePhotoConfigurationCommand, AdminSavePhotoConfigurationCommandValidator>(obj, context);


        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this AdminDeletePhotoConfigurationCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<AdminDeletePhotoConfigurationCommand, AdminDeletePhotoConfigurationCommandValidator>(obj, context);
    }
}

using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.Configuration.Invitation.Commands
{
    /// <summary>
    /// Class AdminGetFamilyUnitHandler used to get a FamilyUnitDto.
    /// Implements the <see cref="IWeddingCommand" />
    /// </summary>
    /// <seealso cref="IWeddingCommand" />
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    /// <param name="InvitationDesign">Invitation code</param>
    public record AdminSavePhotoConfigurationCommand(AuthContext AuthContext, InvitationDesignDto InvitationDesign) : IWeddingCommand;
}

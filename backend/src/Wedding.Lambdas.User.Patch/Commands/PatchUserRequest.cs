using Wedding.Abstractions.Dtos.ClientInfo;

namespace Wedding.Lambdas.User.Patch.Commands
{
    public class PatchUserRequest
    {
        public ClientInfoDto? ClientInfo { get; set; }
    }
}

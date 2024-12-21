using Wedding.Abstractions;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;

namespace Wedding.PublicApi.Logic.Areas.Guest.Commands
{
    public record RsvpGuestCommand(GuestDto 
        Guest) : IWeddingCommand;
}

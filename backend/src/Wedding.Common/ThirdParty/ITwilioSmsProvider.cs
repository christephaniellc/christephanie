using System.Threading.Tasks;

namespace Wedding.Common.ThirdParty
{
    public interface ITwilioSmsProvider
    {
        Task<TwilioOtpStatusEnum> SendOTPCode(string? phoneNumber);
        Task<bool> CheckVerification(string? phoneNumber, string code);
        Task<string?> SendSms(string phoneNumber, bool verified, bool optedIn, string body);
    }
}

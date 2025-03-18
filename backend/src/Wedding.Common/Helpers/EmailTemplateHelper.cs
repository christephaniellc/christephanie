using System.Threading;
using System;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Helpers.JwtClaim;

namespace Wedding.Common.Helpers
{
    public class EmailTemplateHelper
    {
        public static (string textBody, string htmlBody) SendVerificationCodeTemplate(
            ApplicationConfiguration config, 
            VerifiedDto email, 
            string? tokenVerifyLink = null, 
            CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"Sending verification email using Amazon SES. Email: {email.Value} Code: {email.VerificationCode}");

            var htmlBody = $@"
            <html>
            <head></head>
            <body>
                <h1>{config.ApplicationName} Email Verification</h1>
                <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
                <p>[ <a href=""{tokenVerifyLink}"">Verify Email</a> ]</p>
                <p>&nbsp;</p>
                <p>(If this link doesn't work, copy and paste the following URL into your browser:)</p>
                <p>{tokenVerifyLink}</p>
                <p><i>Didn't request this? Ignore this email!</i></p>
            </body>
            </html>";

            var textBody = $@"
                Email Verification

                Thank you for registering!
                Please verify your email address by visiting the following link:
                {tokenVerifyLink}
                ";

            return (textBody, htmlBody);
        }

        public static string GenerateTokenVerificationLink(
            ApplicationConfiguration config,
            string jwtAudience,
            string invitationCode,
            string guestId,
            string code,
            CancellationToken cancellationToken = default)
        {
            var token = ValidationTokenProvider.GenerateJwtToken(jwtAudience, invitationCode, guestId, code, config.EncryptionKey);
            return $"https://{config.DomainName}/verify-email?token={token}";
        }
    }
}

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
        
        public static (string textBody, string htmlBody) SendPaymentConfirmationTemplate(
            ApplicationConfiguration config,
            string name, 
            string email,
            string paymentIntentId,
            decimal amount,
            string category,
            string? notes = null,
            string timestamp = null,
            CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"Sending payment confirmation email using Amazon SES. Email: {email}");
            
            var formattedAmount = amount.ToString("C");
            var formattedDate = !string.IsNullOrEmpty(timestamp) ? 
                DateTime.Parse(timestamp).ToString("MMMM d, yyyy 'at' h:mm tt") : 
                DateTime.UtcNow.ToString("MMMM d, yyyy 'at' h:mm tt");
            
            var notesSection = string.IsNullOrEmpty(notes) ? string.Empty : $@"
                <tr>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: left;"">Notes</td>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{notes}</td>
                </tr>";
                
            var htmlBody = $@"
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }}
                    .header {{ background-color: #6B21A8; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
                    .receipt {{ background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-top: 20px; }}
                    table {{ width: 100%; border-collapse: collapse; }}
                    .check-icon {{ color: #10B981; font-size: 48px; text-align: center; margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class=""header"">
                    <h1>Payment Confirmation</h1>
                </div>
                <div class=""content"">
                    <p>Dear {name},</p>
                    <p>Thank you for your generous contribution to our wedding registry!</p>
                    
                    <div class=""check-icon"">✓</div>
                    
                    <div class=""receipt"">
                        <h2>Receipt Details</h2>
                        <table>
                            <tr>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: left;"">Transaction ID</td>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{paymentIntentId.Substring(Math.Max(0, paymentIntentId.Length - 8))}</td>
                            </tr>
                            <tr>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: left;"">Date</td>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{formattedDate}</td>
                            </tr>
                            <tr>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: left;"">Amount</td>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{formattedAmount} USD</td>
                            </tr>
                            <tr>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: left;"">Fund</td>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{category}</td>
                            </tr>
                            {notesSection}
                        </table>
                    </div>
                    
                    <p>This contribution means a lot to us as we start our life together. We're grateful for your support and generosity.</p>
                    
                    <p>Much love,<br>
                    Steph & Topher</p>
                </div>
                <div class=""footer"">
                    <p>This is an automated email, please do not reply.</p>
                    <p>&copy; {DateTime.Now.Year} {config.ApplicationName}. All rights reserved.</p>
                </div>
            </body>
            </html>";

            var textBody = $@"
                Payment Confirmation

                Dear {name},

                Thank you for your generous contribution to our wedding registry!

                RECEIPT DETAILS
                Transaction ID: {paymentIntentId.Substring(Math.Max(0, paymentIntentId.Length - 8))}
                Date: {formattedDate}
                Amount: {formattedAmount} USD
                Fund: {category}
                {(string.IsNullOrEmpty(notes) ? "" : $"Notes: {notes}")}

                This contribution means a lot to us as we start our life together. We're grateful for your support and generosity.

                Warm regards,
                Steph & Topher

                This is an automated email, please do not reply.
                © {DateTime.Now.Year} {config.ApplicationName}. All rights reserved.
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

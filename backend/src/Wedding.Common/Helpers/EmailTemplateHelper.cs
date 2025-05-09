using System.Threading;
using System;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Helpers.JwtClaim;
using Stripe;

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

        public static (string textBody, string htmlBody) SendRsvpNotificationEmailTemplate(
            ApplicationConfiguration config,
            string name,
            string email,
            bool guestInterested,
            bool guestConfirmed,
            string invitationCode,
            CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"Sending notification email using Amazon SES. Name: {name}. Email: {email}. Code: {invitationCode}. Previous interest? {guestInterested}");
            
            var interestedBlurb = guestInterested ? ", even though you may have already expressed interest in attending" 
                                                        : "";
            var alreadyConfirmedBlurb = guestConfirmed ? "Already confirmed? You're awesome and can ignore this email. Thank you!"
                                                : "";

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
                    <h1>Stubler-Sikorra Wedding: Please RSVP</h1>
                </div>
                <div class=""content"">
                    <p>Dear {name},</p>
                    <p>Our RSVP phase has arrived! As we finalize our headcounts, we'd appreciate if
                        you could take a moment to log in to our site and <b>confirm your RSVP</b>{interestedBlurb}. {alreadyConfirmedBlurb}
                    </p>
                    <p>
                        <b>Hit refresh</b> to see our new site content:
                            <ul>
                                <li>Wedding Registry</li>
                                <li>Details (accommodation, attire, schedule, etc.)</li>               
                                <li>Stats</li>
                            </ul>           
                    </p>

                    <hr/>

                    <h2>[Saturday, July 5] - Wedding</h2>
                    <p>
                        Please RSVP here <b>by May 19, 2025:</b><br/>
                        <a href=""https://christephanie.com?inviteCode={invitationCode}"">https://christephanie.com?inviteCode={invitationCode}</a>
                    </p>
                           
                    <h2>[Friday, July 4] - 4th of July Potluck BBQ</h2>             
                    <p>
                        We will also be hosting a potluck 4th of July BBQ at our venue the day before the wedding, so let us
                        know if you will attend, and what you can bring!<br/>
                        <a href=""https://docs.google.com/spreadsheets/d/1Wz-5LNN4bGuLc7RERxuTrnMNvvlnVOnLcAe95wJcugc/edit?gid=0#gid=0"">4th of July Potluck Signup Sheet
                    </p>

                    <div class=""receipt"">
                        <table>
                            <tr>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: left;"">
                                    Haven't logged in before? No prob!
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 10px; padding-left: 20px; border-bottom: 1px solid #eee; text-align: left;"">
                                    Just go to:
                                    <a href=""https://christephanie.com"">https://christephanie.com</a>
                                </td>
                            </tr>
                            <tr>       
                                <td style=""padding: 10px; padding-left: 30px; border-bottom: 1px solid #eee; text-align: left;""> 
                                    and enter your <b>first name</b> and your family's <b>Invitation Code</b>. Then RSVP!
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: left;"">
                                    Your Invitation Code is:
                                </td>
                            </tr>
                            <tr>
                                <td style=""padding: 10px; padding-left: 20px; border-bottom: 1px solid #eee; text-align: left;"">
                                    <h3>{invitationCode}</h3>
                                </td>
                            </tr>
                        </table>
                    </div>          

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
                Dear {name},

                Our RSVP phase has arrived! 

                Please RSVP by May 19, 2025.

                As we finalize our headcounts, we'd appreciate if
                you could take a moment to log in to our site and confirm your RSVP{interestedBlurb} 

                Hit refresh to see our new site content: 
                    - Wedding Registry
                    - Details (accommodation, attire, schedule, etc.)
                    - Stats                

                Haven't logged in before? No prob! Just go to:
                https://christephanie.com

                And enter your first name and your family's Invitation Code. Your code is:
                {invitationCode}

                Or, copy and paste this link:
                https://christephanie.com?inviteCode={invitationCode}

                We will also be hosting a potluck 4th of July BBQ at our venue the day before the wedding, so let us
                know if you will attend, and what you can bring!

                4th of July Potluck Signup Sheet:
                https://docs.google.com/spreadsheets/d/1Wz-5LNN4bGuLc7RERxuTrnMNvvlnVOnLcAe95wJcugc/edit?gid=0#gid=0

                Much love,
                Steph & Topher

                This is an automated email, please do not reply.
                © {DateTime.Now.Year} {config.ApplicationName}. All rights reserved.
                ";

            return (textBody, htmlBody);
        }
    }
}
                
using System;

namespace Wedding.Lambdas.Validate.Phone.Providers
{
    public static class VerificationCodeProvider
    {
        /// <summary>
        /// Generates a six-digit code for verification
        /// </summary>
        /// <returns></returns>
        public static string GenerateCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        public static DateTime GenerateExpiry()
        {
            return DateTime.UtcNow.AddMinutes(10);
        }
    }
}

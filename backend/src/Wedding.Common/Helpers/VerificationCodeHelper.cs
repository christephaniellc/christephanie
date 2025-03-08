using System;

namespace Wedding.Common.Helpers
{
    public static class VerificationCodeHelper
    {
        /// <summary>
        /// Generates a six-digit code for verification
        /// </summary>
        /// <returns></returns>
        public static string GenerateCode()
        {
            var random = new Random();
            var code = random.Next(100000, 999999).ToString();
            Console.WriteLine($"Generated code: {code}");
            return code;
        }

        public static DateTime GenerateExpiry()
        {
            return DateTime.UtcNow.AddMinutes(10);
        }
    }
}

using System;
using PhoneNumbers;

namespace Wedding.Abstractions.ViewModels
{
    public static class ObfuscationHelper
    {
        /// <summary>
        /// Masks a phone number using the PhoneNumbers library so that the output is consistently formatted as: 
        /// US: +1-XXX-XXX-1234; non-US (10-digit national): +CC-XXXX-XX1234.
        /// If a US number is missing a digit, we prepend a leading "1".
        /// </summary>
        public static string MaskPhone(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return string.Empty;

            try
            {
                var phoneUtil = PhoneNumberUtil.GetInstance();
                // Parse using "US" as default region.
                var parsedNumber = phoneUtil.Parse(phone, "US");

                ulong nationalNumLong = parsedNumber.NationalNumber;
                string nationalNumber = nationalNumLong.ToString();

                // If country code is 1 (US) but the national number has only 9 digits, assume a missing leading digit.
                if (parsedNumber.CountryCode == 1 && nationalNumber.Length == 9)
                {
                    nationalNumber = "1" + nationalNumber;
                }

                // If after adjustments the national number is too short to mask, return as-is.
                if (nationalNumber.Length < 4)
                    return phone;

                string maskedNational;
                if (parsedNumber.CountryCode == 1 && nationalNumber.Length == 10)
                {
                    // US format: mask first 6 digits as X, formatted as XXX-XXX-1234.
                    string lastFour = nationalNumber.Substring(6);
                    maskedNational = new string('X', 6) + lastFour;
                    // Insert dashes to get XXX-XXX-1234.
                    maskedNational = $"{maskedNational.Substring(0, 3)}-{maskedNational.Substring(3, 3)}-{maskedNational.Substring(6)}";
                    return $"+{parsedNumber.CountryCode}-{maskedNational}";
                }
                else if (nationalNumber.Length == 10)
                {
                    // Non-US with a 10-digit national number: mask first 6 digits as X, formatted as XXXX-XX1234.
                    string lastFour = nationalNumber.Substring(6);
                    maskedNational = new string('X', 6) + lastFour;
                    // Insert dash between first 4 and next 2.
                    maskedNational = $"{maskedNational.Substring(0, 4)}-{maskedNational.Substring(4, 2)}{maskedNational.Substring(6)}";
                    return $"+{parsedNumber.CountryCode}-{maskedNational}";
                }
                else
                {
                    // Default: mask all but the last 4 digits.
                    string masked = new string('X', nationalNumber.Length - 4) + nationalNumber.Substring(nationalNumber.Length - 4);
                    return $"+{parsedNumber.CountryCode}-{masked}";
                }
            }
            catch (Exception)
            {
                // Fallback logic for numbers that cannot be parsed.
                return MaskPhoneFallback(phone);
            }
        }

        /// <summary>
        /// Fallback masking method in case PhoneNumbers parsing fails.
        /// This version applies similar padding for US numbers if needed.
        /// </summary>
        private static string MaskPhoneFallback(string phone)
        {
            // If number is too short, return as-is.
            if (phone.Length < 4)
                return phone;

            // Determine country code and local part.
            string countryCode = string.Empty;
            string localNumber = phone;

            if (phone.StartsWith("+"))
            {
                int dashIndex = phone.IndexOf("-");
                if (dashIndex > 0)
                {
                    countryCode = phone.Substring(0, dashIndex);
                    localNumber = phone.Substring(dashIndex + 1);
                }
                else
                {
                    // Assume the country code is the first two characters.
                    countryCode = phone.Substring(0, 2);
                    localNumber = phone.Substring(2);
                }
            }
            else
            {
                // Assume default US country code.
                countryCode = "+1";
                // If local number is 9 digits, pad with a "1" to simulate a 10-digit US number.
                if (localNumber.Length == 9)
                {
                    localNumber = "1" + localNumber;
                }
            }

            if (localNumber.Length < 4)
                return phone;

            // Default to US-style masking if country is US.
            if (countryCode == "+1" && localNumber.Length == 10)
            {
                string lastFour = localNumber.Substring(6);
                string masked = new string('X', 6) + lastFour;
                masked = $"{masked.Substring(0, 3)}-{masked.Substring(3, 3)}-{masked.Substring(6)}";
                return $"{countryCode}-{masked}";
            }
            else if (localNumber.Length == 10)
            {
                // For non-US 10-digit numbers, use the non-US masking style.
                string lastFour = localNumber.Substring(6);
                string masked = new string('X', 6) + lastFour;
                masked = $"{masked.Substring(0, 4)}-{masked.Substring(4, 2)}{masked.Substring(6)}";
                return $"{countryCode}-{masked}";
            }
            else
            {
                // Otherwise, mask all but the last 4 digits.
                string masked = new string('X', localNumber.Length - 4) + localNumber.Substring(localNumber.Length - 4);
                return $"{countryCode}-{masked}";
            }
        }

        /// <summary>
        /// Masks an email address by replacing the inner characters of the username with asterisks.
        /// </summary>
        public static string MaskEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
                return email ?? string.Empty;

            var parts = email.Split('@');
            var name = parts[0];
            var domain = parts[1];

            if (name.Length <= 2)
                return $"{name[0]}***@{domain}";

            return $"{name[0]}***{name[^1]}@{domain}";
        }
    }
}

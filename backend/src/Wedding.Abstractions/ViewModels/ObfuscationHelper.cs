using System;

namespace Wedding.Abstractions.ViewModels
{
    public static class ObfuscationHelper
    {
        public static string MaskPhone(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone) || phone.Length < 4)
                return phone ?? String.Empty; // Return as-is if the phone number is too short

            return $"+x-xxx-xxx-{phone[^4..]}";
        }

        public static string MaskEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
                return email ?? String.Empty; // Return as-is if invalid email

            var parts = email.Split('@');
            var name = parts[0];
            var domain = parts[1];

            if (name.Length <= 2)
                return $"{name[0]}***@{domain}"; // Edge case for very short usernames

            return $"{name[0]}***{name[^1]}@{domain}";
        }
    }
}

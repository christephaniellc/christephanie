using System;
using System.Text.Json;

namespace Wedding.Abstractions.Dtos
{
    public class VerifyDto
    {
        public bool Verified { get; set; }
        public string? VerificationCode { get; set; }
        public DateTime? VerificationCodeExpiration { get; set; }
        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}

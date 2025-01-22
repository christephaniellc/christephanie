using System;
using System.Text.Json;

namespace Wedding.Abstractions.Dtos
{
    public class LastUpdateAuditDto
    {
        public DateTime LastUpdate { get; set; }

        public string Username { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}

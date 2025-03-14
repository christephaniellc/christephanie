using System.Text.Json;
using System;

namespace Wedding.Abstractions.Dtos.ClientInfo
{
    public class ClientInfoDto
    {
        public DateTime DateRecorded { get; set; }

        public string? IpAddress { get; set; }

        public string? Os { get; set; }

        public BrowserInfoDto? Browser { get; set; }

        public ScreenInfoDto? Screen { get; set; }

        public string? Language { get; set; }

        public string? TimeZone { get; set; }

        public DeviceInfoDto? Device { get; set; }

        public ConnectionInfoDto? Connection { get; set; }

        public GeolocationInfoDto? Geolocation { get; set; }

        public string? Referrer { get; set; }

        public StorageSupportInfoDto? StorageSupport { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}

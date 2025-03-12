namespace Wedding.Abstractions.Dtos.ClientInfo
{
    public class DeviceInfoDto
    {
        public string? Type { get; set; }
        public bool? TouchSupport { get; set; }
        public string? HardwareConcurrency { get; set; }
        public string? DeviceMemory { get; set; }
    }
}

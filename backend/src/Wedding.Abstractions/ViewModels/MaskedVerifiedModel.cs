using System.Text.Json;

namespace Wedding.Abstractions.ViewModels
{
    public class MaskedVerifiedModel
    {
        public string? MaskedValue { get; set; }
        public bool Verified { get; set; }
        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}

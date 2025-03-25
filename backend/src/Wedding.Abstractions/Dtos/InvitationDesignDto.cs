using System.Collections.Generic;
using System.Text.Json;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class InvitationDesignDto : ConfigurationDesignDto
    {
        public OrientationEnum? Orientation { get; set; }

        public int? SeparatorWidth { get; set; }

        public string? SeparatorColor { get; set; }

        public List<PhotoGridItemDto>? PhotoGridItems { get; set; }
        
        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}

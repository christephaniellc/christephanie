using System;
using System.Text.Json;

namespace Wedding.Abstractions.Dtos
{
    public class PhotoGridItemDto
    {
        public Guid Id { get; set; }
        public string PhotoSrc { get; set; } = "";
        public int RowPosition { get; set; } 
        public int ColumnPosition { get; set; }
        public bool IsLocked { get; set; }
        public string? ObjectFit { get; set; }
        public string? ObjectPosition { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}

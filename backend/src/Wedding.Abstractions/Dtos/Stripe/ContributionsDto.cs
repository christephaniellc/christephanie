using System.Collections.Generic;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos.Stripe
{
    public class ContributionsDto
    {
        public List<ContributionDto>? Contributions { get; set; } = new List<ContributionDto>();
        public int? TotalCount { get; set; }
        public int? TotalAmount { get; set; }
        public Dictionary<GiftCategoryEnum, int>? CategorySummary { get; set; } = new Dictionary<GiftCategoryEnum, int>();
    }
}

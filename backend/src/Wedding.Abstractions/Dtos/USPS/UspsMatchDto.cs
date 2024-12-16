namespace Wedding.Abstractions.Dtos.USPS
{
    public class UspsMatchDto
    {
        /// <summary>
        /// string = 1 characters \w{1}
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// string
        /// </summary>
        public string Text { get; set; }
    }
}

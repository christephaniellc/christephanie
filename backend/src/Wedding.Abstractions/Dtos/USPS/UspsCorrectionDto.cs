namespace Wedding.Abstractions.Dtos.USPS
{
    public class UspsCorrectionDto
    {
        /// <summary>
        /// string = 1 characters \w{1}
        ///     The code corresponding to the address correction.
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// This is the description of the address correction.
        /// </summary>
        public string Text { get; set; }
    }
}

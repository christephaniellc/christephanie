namespace Wedding.Abstractions.Dtos.USPS
{
    public class UspsAdditionalInfoDto
    {
        /// <summary>
        /// A specific set of digits between 00 and 99 assigned to every address that is combined with the ZIP + 4® Code
        /// to provide a unique identifier for every delivery address.
        ///
        /// A street address does not necessarily represent a single delivery point because a street address such as one
        /// for an apartment building may have several delivery points.
        /// </summary>
        public string? DeliveryPoint { get; set; }

        /// <summary>
        /// This is the carrier route code (values unspecified).
        /// </summary>
        public string? CarrierRoute { get; set; }

        /// <summary>
        /// Enum: "Y" "D" "S" "N"
        /// The DPV Confirmation Indicator is the primary method used by the USPS® to determine whether an address was considered deliverable or undeliverable.
        /// 
        ///     Y 'Address was DPV confirmed for both primary and (if present) secondary numbers.'
        ///     D 'Address was DPV confirmed for the primary number only, and the secondary number information was missing.'
        ///     S 'Address was DPV confirmed for the primary number only, and the secondary number information was present but not confirmed.'
        ///     N 'Both primary and (if present) secondary number information failed to DPV confirm.'
        /// </summary>
        public string? DPVConfirmation { get; set; }

        /// <summary>
        /// Enum: "Y" "N"
        /// Indicates if the location is a Commercial Mail Receiving Agency(CMRA)
        ///     Y 'Address was found in the CMRA table. '
        ///     N 'Address was not found in the CMRA table.'
        /// </summary>
        public string? DPVCMRA { get; set; }

        /// <summary>
        /// Enum: "Y" "N"
        /// Indicates whether this is a business address.
        ///     Y 'The address is a business address.'
        ///     N 'The address is not a business address.'
        /// </summary>
        public string? Business { get; set; }

        /// <summary>
        /// Enum: "Y" "N"
        /// Central Delivery is for all business office buildings, office complexes, and/or industrial/professional parks.
        /// This may include call windows, horizontal locked mail receptacles, cluster box units.
        /// 
        ///     Y 'The address is a central delivery point.'
        ///     N 'The address is not a central delivery point.'
        /// </summary>
        public string? CentralDeliveryPoint { get; set; }

        /// <summary>
        /// Enum: "Y" "N"
        /// Indicates whether the location designated by the address is occupied.
        ///
        ///     Y 'The address is occupied.' * N 'The address is not occupied.'
        /// </summary>
        public string? Vacant { get; set; }
    }
}

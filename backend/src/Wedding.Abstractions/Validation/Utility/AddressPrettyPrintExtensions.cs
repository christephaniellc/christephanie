using System.Text;
using Wedding.Abstractions.Dtos;

namespace Wedding.Abstractions.Validation.Utility
{
    public static class AddressPrettyPrintExtensions
    {
        public static string PrettyPrint(this AddressDto dto)
        {
            var stringBuilder = new StringBuilder(); if (!string.IsNullOrWhiteSpace(dto.StreetAddress))
            {
                stringBuilder.AppendLine(dto.StreetAddress);
            }

            // Append the secondary address if it exists
            if (!string.IsNullOrWhiteSpace(dto.SecondaryAddress))
            {
                stringBuilder.AppendLine(dto.SecondaryAddress);
            }

            // Append city, state, and postal code (formatted)
            if (!string.IsNullOrWhiteSpace(dto.City) && !string.IsNullOrWhiteSpace(dto.State))
            {
                stringBuilder.Append(dto.City);
                stringBuilder.Append(", ");
                stringBuilder.Append(dto.State);
            }


            if (!string.IsNullOrWhiteSpace(dto.ZIPCode))
            {
                stringBuilder.Append(" ");
                stringBuilder.Append(dto.ZIPCode);
            }

            if (!string.IsNullOrWhiteSpace(dto.ZIPPlus4))
            {
                stringBuilder.Append($"-{dto.ZIPPlus4}\n");
            }

            // if (!string.IsNullOrWhiteSpace(dto.PostalCode))
            // {
            //     stringBuilder.Append(" ");
            //     stringBuilder.Append(dto.PostalCode);
            // }
            //
            // stringBuilder.AppendLine();
            //
            // // Append country if it exists
            // if (!string.IsNullOrWhiteSpace(dto.Country))
            // {
            //     stringBuilder.AppendLine(dto.Country);
            // }
            //
            // if (!string.IsNullOrWhiteSpace(dto.Urbanization))
            // {
            //     stringBuilder.Append($"Urbanization: {dto.Urbanization}\n");
            // }

            return stringBuilder.ToString().Trim();
        }
    }
}

using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Wedding.PublicApi.Logic.Services
{
    public class MailingAddressValidationProvider : IMailingAddressValidationProvider
    {
        private readonly string _uspsUserId;
        private readonly string _uspsApiUrl;

        public MailingAddressValidationProvider(string uspsUserId, string uspsApiUrl)
        {
            _uspsUserId = uspsUserId;
            _uspsApiUrl = uspsApiUrl;
        }
        private async Task<bool> IsValidUspsAddress(string address)
        {
            using (var client = new HttpClient())
            {
                var requestUrl = $"{_uspsApiUrl}?API=Verify&XML=" +
                                 $"<AddressValidateRequest USERID=\"{_uspsUserId}\">" +
                                 $"<Address><Address1></Address1><Address2>{address}</Address2><City></City><State></State><Zip5></Zip5><Zip4></Zip4></Address>" +
                                 $"</AddressValidateRequest>";

                var response = await client.GetStringAsync(requestUrl);
                var xmlDoc = XDocument.Parse(response);

                var error = xmlDoc.Descendants("Error").FirstOrDefault();
                return error == null;
            }
        }
    }
}

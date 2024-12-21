using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace Wedding.Common.Helpers
{
    public static class HeaderHelper
    {
        public static Dictionary<string, string>? GetHeaders(IHeaderDictionary headerDictionary)
        {
            return headerDictionary
                .ToDictionary(header => header.Key, header => header.Value.ToString());
        }
    }
}

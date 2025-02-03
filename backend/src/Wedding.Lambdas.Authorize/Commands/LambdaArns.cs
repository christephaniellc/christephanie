using System.Collections.Generic;
using System.Linq;

namespace Wedding.Lambdas.Authorize.Commands
{
    public static class LambdaArns
    {
        public const string AdminFamilyUnitCreate = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-admin-familyunit-create";
        public const string AdminFamilyUnitGet = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-admin-familyunit-get";
        public const string AdminFamilyUnitUpdate = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-admin-familyunit-update";
        public const string AdminFamilyUnitDelete = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-admin-familyunit-delete";

        public const string FamilyUnitGet = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-familyunit-get";
        public const string FamilyUnitUpdate = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-familyunit-update";

        public const string UserFind = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-user-find";
        public const string UserGet = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-user-get";

        public const string Auth = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-authorize";

        public const string AddressValidate = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-validate-address";
    }

    public static class LambdaArnTranslations
    {
        public const string _region = "us-east-1";
        public const string _stage = "dev";
        public const string _devAccount = "390403858788";
        public const string _devApiGateway = "b4f6i318q9";

        // public static Dictionary<string, string> Translations = new Dictionary<string, string>() {
        //     { "PUT /api/admin/familyunit", LambdaArns.AdminFamilyUnitCreate },
        //     { "GET /api/admin/familyunit", LambdaArns.AdminFamilyUnitGet },
        //     { "POST /api/admin/familyunit", LambdaArns.AdminFamilyUnitUpdate },
        //     { "DELETE /api/admin/familyunit", LambdaArns.AdminFamilyUnitDelete },
        //     { "GET /api/familyunit", LambdaArns.FamilyUnitGet },
        //     { "POST /api/familyunit", LambdaArns.FamilyUnitUpdate },
        //     { "GET /api/user", LambdaArns.UserFind },
        //     { "GET /api/user/me", LambdaArns.UserGet },
        //     { "?", LambdaArns.Auth },
        //     { "??", LambdaArns.AddressValidate },
        // };

        public static string ConvertToArn(string routeKey)
        {
            //var translation = LambdaArnTranslations.Translations[routeKey];
            var translation = $"arn:aws:execute-api:{_region}:{_devAccount}:{_devApiGateway}/{_stage}/{routeKey.Replace(" ", "")}";
            
            var methodArnParts = translation.Split(':');
            var apiArnPrefix = string.Join(':', methodArnParts.Take(5)); // Up to `execute-api`
            var apiArnSuffix = methodArnParts.Last();

            //return $"{translation}/{_stage}/*";
            return translation;
        }
    }
}

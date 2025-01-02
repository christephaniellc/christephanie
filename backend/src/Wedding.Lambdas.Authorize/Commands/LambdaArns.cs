using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Wedding.Lambdas.Authorize.Commands
{
    public static class LambdaArns
    {
        public const string AdminFamilyUnitCreate = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-admin-familyunit-create";
        public const string AdminFamilyUnitUpdate = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-admin-familyunit-update";
        public const string AdminFamilyUnitDelete = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-admin-familyunit-delete";

        public const string FamilyUnitGet = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-familyunit-get";
        public const string FamilyUnitUpdate = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-familyunit-update";

        public const string UserFind = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-user-find";
        public const string UserGet = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-user-get";

        public const string Auth = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-authorize";

        public const string AddressValidate = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-validate-address";
    }

    public static class LambdaArnTranslations
    {
        public const string _stage = "proto";

        public static Dictionary<string, string> Translations = new Dictionary<string, string>() {
            { "PUT /api/admin/familyunit", LambdaArns.AdminFamilyUnitCreate },
            { "POST /api/admin/familyunit", LambdaArns.AdminFamilyUnitUpdate },
            { "DELETE /api/admin/familyunit", LambdaArns.AdminFamilyUnitDelete },
            { "GET /api/familyunit", LambdaArns.FamilyUnitGet },
            { "POST /api/familyunit", LambdaArns.FamilyUnitUpdate },
            { "GET /api/user", LambdaArns.UserFind },
            { "GET /api/user/me", LambdaArns.UserGet },
            { "?", LambdaArns.Auth },
            { "??", LambdaArns.AddressValidate },
        };

        public static string ConvertToArn(string routeKey)
        {
            //var translation = LambdaArnTranslations.Translations[routeKey];
            var translation = $"arn:aws:execute-api:us-east-1:502723119948:fpo6t7lub7/{_stage}/{routeKey.Replace(" ", "")}";
            
            var methodArnParts = translation.Split(':');
            var apiArnPrefix = string.Join(':', methodArnParts.Take(5)); // Up to `execute-api`
            var apiArnSuffix = methodArnParts.Last();

            //return $"{translation}/{_stage}/*";
            return translation;
        }
    }
}

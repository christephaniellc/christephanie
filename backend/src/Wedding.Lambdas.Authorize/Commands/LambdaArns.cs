namespace Wedding.Lambdas.Authorize.Commands
{
    public static class LambdaArns
    {
        public const string AdminFamilyUnitCreate = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-admin-familyunit-create";
        public const string AdminFamilyUnitUpdate = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-admin-familyunit-update";
        public const string AdminFamilyUnitDelete = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-admin-familyunit-delete";

        public const string FamilyUnitGet = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-familyunit-get";
        public const string FamilyUnitUpdate = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-familyunit-update";

        public const string UserGet = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-user-get";

        public const string Auth = "arn:aws:lambda:us-east-1:502723119948:function:christephanie-api-dev-authorize";
    }
}

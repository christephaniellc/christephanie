// using System;
// using System.Text.Json;
// using Amazon.Lambda.APIGatewayEvents;
// using Wedding.Common.Helpers.AWS.Frontend;
//
// namespace Wedding.Common.Utility.Testing.TestChain
// {
//     public static class APIGatewayProxyResponseHelper
//     {
//         public static T GetResponseBody<T>(APIGatewayProxyResponse response)
//         {
//             var body = JsonSerializer.Deserialize<FrontendApiResponse>(response.Body);
//             return JsonSerializer.Deserialize<T>(body.Data.ToString()) 
//                    ?? throw new InvalidOperationException();
//         }
//     }
// }

// using System.Collections.Generic;
// using System.Threading;
// using System.Threading.Tasks;
// using Amazon.DynamoDBv2.DataModel;
//
// namespace Wedding.Common.Utility.Testing.Utility
// {
//     public class MockAsyncSearch<T> : AsyncSearch<T>
//     {
//         private readonly List<T> _results;
//
//         public MockAsyncSearch(List<T> results)
//         {
//             _results = results;
//         }
//
//         public override Task<List<T>> GetRemainingAsync(CancellationToken cancellationToken = default)
//         {
//             return Task.FromResult(_results);
//         }
//     }
// }

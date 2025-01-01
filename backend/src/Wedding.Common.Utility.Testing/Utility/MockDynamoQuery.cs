// using System.Collections.Generic;
// using System.Threading.Tasks;
//
// namespace Wedding.Common.Utility.Testing.Utility
// {
//     public class MockDynamoQuery<T> : IAsyncEnumerable<T>
//     {
//         private readonly List<T> _mockData;
//
//         public MockDynamoQuery(List<T> mockData)
//         {
//             _mockData = mockData;
//         }
//
//         public Task<List<T>> GetRemainingAsync()
//         {
//             return Task.FromResult(_mockData);
//         }
//
//         public async IAsyncEnumerator<T> GetAsyncEnumerator(System.Threading.CancellationToken cancellationToken = default)
//         {
//             foreach (var item in _mockData)
//             {
//                 yield return item;
//                 await Task.Yield(); // Simulate asynchronous behavior
//             }
//         }
//     }
// }

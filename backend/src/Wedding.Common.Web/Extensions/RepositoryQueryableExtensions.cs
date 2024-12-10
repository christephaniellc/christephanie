// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading;
// using System.Threading.Tasks;
// using Microsoft.EntityFrameworkCore;
// using Wedding.Data.Repository;
//
// namespace Wedding.Abstractions.Repository
// {
//     /// <summary>
//     /// Class QueryableExtensions.
//     /// </summary>
//     public static class RepositoryQueryableExtensions
//     {
//         private static NotSupportedException NotSupported(string methodName = "")
//             => new($"The method {methodName} is not supported. IRepository/IAsyncRepository.Set<T>() must be implemented by Microsoft.EntityFrameworkCore.DbSet<T>");
//
//         /// <summary>
//         /// Add a new entity to the specified DB set in an "added" state.
//         /// </summary>
//         /// <typeparam name="T">The type of the entity being added.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="entity">The entity.</param>
//         /// <returns>The added entity.</returns>
//         /// <exception cref="ArgumentException">The parameter must be implemented by DbSet{T} - queryable</exception>
//         public static T Add<T>(this IQueryable<T> queryable, T entity)
//             where T : class
//             => queryable is DbSet<T> dbSet
//                     ? dbSet.Add(entity).Entity
//                     : throw NotSupported(nameof(Add));
//
//         /// <summary>
//         /// Finds an entity with the specified primary key values.
//         /// </summary>
//         /// <typeparam name="T">The type of the entities being queried.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="keyValues">The primary key values.</param>
//         /// <returns>System.Nullable&lt;T&gt;.</returns>
//         /// <exception cref="NotSupportedException">
//         /// The method Find is supported only if IRepository.Set&lt;T&gt; is implemented by Entity Framework's DbSet&lt;T&gt;>
//         /// </exception>
//         // TODO: Should we [Obsolete("Prefer implementing IFindable on the entities of type T and using `T? Find<T>(this IQueryable<T> queryable, T findable)`.")]
//         public static T? Find<T>(this IQueryable<T> queryable, params object?[]? keyValues)
//             where T : class
//             => queryable is DbSet<T> dbSet
//                     ? dbSet.Find(keyValues)
//                     : throw NotSupported(nameof(Find));
//
//         /// <summary>
//         /// Finds an entity with the specified primary key values.
//         /// </summary>
//         /// <typeparam name="T">The type of the entities being queried.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="findable">The primary key values.</param>
//         /// <returns>System.Nullable&lt;T&gt;.</returns>
//         /// <exception cref="NotSupportedException">
//         /// The method Find is supported only if IRepository.Set&lt;T&gt; is implemented by Entity Framework's DbSet&lt;T&gt;>
//         /// </exception>
//         public static T? Find<T>(this IQueryable<T> queryable, T findable)
//             where T : class, IFindable
//             => queryable is DbSet<T> dbSet
//                     ? dbSet.Find(findable.KeyValues?.ToArray())
//                     : throw NotSupported(nameof(Find));
//
//         /// <summary>
//         /// Attaches a new entity to the specified DB set in a "unmodified" state.
//         /// </summary>
//         /// <typeparam name="T">The type of the entity being attached.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="entity">The entity.</param>
//         /// <returns>The attached entity.</returns>
//         /// <exception cref="ArgumentException">The parameter must be implemented by DbSet{T} - queryable</exception>
//         public static T Attach<T>(this IQueryable<T> queryable, T entity)
//             where T : class
//             => queryable is DbSet<T> dbSet
//                     ? dbSet.Attach(entity).Entity
//                     : throw NotSupported(nameof(Attach));
//
//         /// <summary>
//         /// Attaches a new entity to the specified DB set in a "modified" state.
//         /// </summary>
//         /// <typeparam name="T">The type of the entity being updated.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="entity">The entity.</param>
//         /// <returns>The updated entity.</returns>
//         /// <exception cref="ArgumentException">The parameter must be implemented by DbSet{T} - queryable</exception>
//         public static T Update<T>(this IQueryable<T> queryable, T entity)
//             where T : class
//             => queryable is DbSet<T> dbSet
//                     ? dbSet.Update(entity).Entity
//                     : throw NotSupported(nameof(Update));
//
//         /// <summary>
//         /// Removes an entity from the specified DB set and marks it for deletion.
//         /// </summary>
//         /// <typeparam name="T">The type of the entity being removed.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="entity">The entity.</param>
//         /// <returns>The removed entity.</returns>
//         /// <exception cref="ArgumentException">The parameter must be implemented by DbSet{T} - queryable</exception>
//         public static T Remove<T>(this IQueryable<T> queryable, T entity)
//             where T : class
//             => queryable is DbSet<T> dbSet
//                     ? dbSet.Remove(entity).Entity
//                     : throw NotSupported(nameof(Remove));
//
//         /// <summary>
//         /// Add as an asynchronous operation.
//         /// </summary>
//         /// <typeparam name="T">The type of the entity being added.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="entity">The entity.</param>
//         /// <param name="cancellationToken">The cancellation token that can be used by other objects or threads to receive notice of cancellation.</param>
//         /// <returns>A ValueTask&lt;T&gt; representing the asynchronous operation.</returns>
//         /// <exception cref="ArgumentException">The parameter must be implemented by DbSet{T} - queryable</exception>
//         public static async Task<T> AddAsync<T>(
//             this IQueryable<T> queryable,
//             T entity,
//             CancellationToken cancellationToken = default)
//             where T : class
//             => queryable is DbSet<T> dbSet
//                     ? (await dbSet.AddAsync(entity, cancellationToken).ConfigureAwait(false)).Entity
//                     : throw NotSupported(nameof(AddAsync));
//
//         /// <summary>
//         /// Find as an asynchronous operation.
//         /// </summary>
//         /// <typeparam name="T">The type of the entity being queued.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="keyValues">The key values.</param>
//         /// <param name="cancellationToken">The cancellation token that can be used by other objects or threads to receive notice of cancellation.</param>
//         /// <returns>A Task&lt;T&gt; representing the asynchronous operation.</returns>
//         // TODO: Should we [Obsolete("Prefer implementing IFindable on the entities of type T and using `async Task<T?> FindAsync<T>(this IQueryable<T> queryable, IFindable findable, CancellationToken cancellationToken)`.")]
//         public static async Task<T?> FindAsync<T>(
//             this IQueryable<T> queryable,
//             IEnumerable<object?>? keyValues,
//             CancellationToken cancellationToken = default)
//             where T : class
//             => queryable is DbSet<T> dbSet
//                     ? await dbSet.FindAsync(keyValues?.ToArray(), cancellationToken).ConfigureAwait(false)
//                     : throw NotSupported(nameof(FindAsync));
//
//         /// <summary>
//         /// Find as an asynchronous operation.
//         /// </summary>
//         /// <typeparam name="T">The type of the entity being queued.</typeparam>
//         /// <param name="queryable">
//         /// The queryable. It must be <see cref="DbSet{TEntity}"/>, i.e. cannot be 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.TenantSet{TEntity}"/> or 
//         /// <see cref="M:DelineaExtensions.RepositoryExtensions.PartitionedByTenantSet{TEntity}"/>.
//         /// </param>
//         /// <param name="findable"></param>
//         /// <param name="cancellationToken">The cancellation token that can be used by other objects or threads to receive notice of cancellation.</param>
//         /// <returns>A Task&lt;T&gt; representing the asynchronous operation.</returns>
//         public static async Task<T?> FindAsync<T>(
//             this IQueryable<T> queryable,
//             IFindable findable,
//             CancellationToken cancellationToken = default)
//             where T : class
//             => queryable is DbSet<T> dbSet
//                     ? await dbSet.FindAsync(findable.KeyValues?.ToArray(), cancellationToken).ConfigureAwait(false)
//                     : throw NotSupported(nameof(FindAsync));
//     }
// }

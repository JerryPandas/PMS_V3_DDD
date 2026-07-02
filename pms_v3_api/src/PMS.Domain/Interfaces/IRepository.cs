using System.Linq.Expressions;
using PMS.Domain.Common;

namespace PMS.Domain.Interfaces;

/// <summary>
/// Generic repository interface (Domain layer only defines contracts, concrete implementations in Infrastructure layer,
/// this embodies the Dependency Inversion Principle in DDD)
/// </summary>
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<List<T>> ListAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default);
    Task<T> AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
    IQueryable<T> Query();
}

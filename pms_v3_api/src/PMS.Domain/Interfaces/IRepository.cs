using System.Linq.Expressions;
using PMS.Domain.Common;

namespace PMS.Domain.Interfaces;

/// <summary>
/// 通用仓储接口（Domain 层只定义契约，具体实现放在 Infrastructure 层，
/// 这是 DDD 中依赖倒置原则的体现）
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

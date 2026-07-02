using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using PMS.Domain.Common;
using PMS.Domain.Interfaces;
using PMS.Infrastructure.Persistence;

namespace PMS.Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core-based generic repository implementation
/// </summary>
public class Repository<T> : IRepository<T> where T : BaseEntity
{
    private readonly PmsDbContext _db;
    private readonly DbSet<T> _set;

    public Repository(PmsDbContext db)
    {
        _db = db;
        _set = db.Set<T>();
    }

    public async Task<T?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await _set.FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<List<T>> ListAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default)
    {
        IQueryable<T> query = _set;
        if (predicate is not null) query = query.Where(predicate);
        return await query.ToListAsync(ct);
    }

    public async Task<T> AddAsync(T entity, CancellationToken ct = default)
    {
        await _set.AddAsync(entity, ct);
        return entity;
    }

    public void Update(T entity) => _set.Update(entity);

    public void Remove(T entity) => _set.Remove(entity);

    public IQueryable<T> Query() => _set.AsQueryable();
}

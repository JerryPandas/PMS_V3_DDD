using PMS.Domain.Entities;
using PMS.Domain.Interfaces;
using PMS.Infrastructure.Persistence.Repositories;

namespace PMS.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly PmsDbContext _db;

    public UnitOfWork(PmsDbContext db)
    {
        _db = db;
        Users = new Repository<User>(db);
        RefreshTokens = new Repository<RefreshToken>(db);
        People = new Repository<Person>(db);
        Projects = new Repository<Project>(db);
        ProjectItems = new Repository<ProjectItem>(db);
        ProjectFiles = new Repository<ProjectFile>(db);
        KanbanBoards = new Repository<KanbanBoard>(db);
        KanbanColumns = new Repository<KanbanColumn>(db);
        KanbanCards = new Repository<KanbanCard>(db);
        KanbanCardAssignees = new Repository<KanbanCardAssignee>(db);
    }

    public IRepository<User> Users { get; }
    public IRepository<RefreshToken> RefreshTokens { get; }
    public IRepository<Person> People { get; }
    public IRepository<Project> Projects { get; }
    public IRepository<ProjectItem> ProjectItems { get; }
    public IRepository<ProjectFile> ProjectFiles { get; }
    public IRepository<KanbanBoard> KanbanBoards { get; }
    public IRepository<KanbanColumn> KanbanColumns { get; }
    public IRepository<KanbanCard> KanbanCards { get; }
    public IRepository<KanbanCardAssignee> KanbanCardAssignees { get; }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);

    public void Dispose() => _db.Dispose();
}

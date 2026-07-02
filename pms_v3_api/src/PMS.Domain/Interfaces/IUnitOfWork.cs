using PMS.Domain.Entities;

namespace PMS.Domain.Interfaces;

/// <summary>
/// Unit of work: centrally manages repository instances and transaction commits
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<RefreshToken> RefreshTokens { get; }
    IRepository<Person> People { get; }
    IRepository<Project> Projects { get; }
    IRepository<ProjectItem> ProjectItems { get; }
    IRepository<ProjectFile> ProjectFiles { get; }
    IRepository<KanbanBoard> KanbanBoards { get; }
    IRepository<KanbanColumn> KanbanColumns { get; }
    IRepository<KanbanCard> KanbanCards { get; }
    IRepository<KanbanCardAssignee> KanbanCardAssignees { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

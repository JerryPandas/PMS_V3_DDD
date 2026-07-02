using PMS.Domain.Entities;

namespace PMS.Domain.Interfaces;

/// <summary>
/// 工作单元：统一管理仓储实例与事务提交
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

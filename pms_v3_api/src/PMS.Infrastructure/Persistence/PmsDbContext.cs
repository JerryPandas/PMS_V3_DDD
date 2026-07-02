using Microsoft.EntityFrameworkCore;
using PMS.Domain.Entities;

namespace PMS.Infrastructure.Persistence;

/// <summary>
/// EF Core 数据上下文。所有表名加前缀由各实体配置类统一指定（可选）。
/// </summary>
public class PmsDbContext : DbContext
{
    public PmsDbContext(DbContextOptions<PmsDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Person> People => Set<Person>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectItem> ProjectItems => Set<ProjectItem>();
    public DbSet<ProjectFile> ProjectFiles => Set<ProjectFile>();
    public DbSet<KanbanBoard> KanbanBoards => Set<KanbanBoard>();
    public DbSet<KanbanColumn> KanbanColumns => Set<KanbanColumn>();
    public DbSet<KanbanCard> KanbanCards => Set<KanbanCard>();
    public DbSet<KanbanCardAssignee> KanbanCardAssignees => Set<KanbanCardAssignee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PmsDbContext).Assembly);

        // 全局软删除过滤器
        modelBuilder.Entity<Project>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<ProjectItem>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<ProjectFile>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<Person>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<KanbanBoard>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<KanbanColumn>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<KanbanCard>().HasQueryFilter(p => !p.IsDeleted);

        base.OnModelCreating(modelBuilder);
    }
}

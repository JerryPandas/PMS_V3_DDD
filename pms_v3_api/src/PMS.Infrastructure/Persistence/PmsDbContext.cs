using Microsoft.EntityFrameworkCore;
using PMS.Domain.Entities;

namespace PMS.Infrastructure.Persistence;

/// <summary>
/// EF Core data context. Table name prefixes can be specified by entity configuration classes (optional).
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

        // Global soft delete query filters
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

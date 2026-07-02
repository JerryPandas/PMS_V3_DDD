using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMS.Domain.Entities;

namespace PMS.Infrastructure.Persistence.Configurations;

public class KanbanBoardConfiguration : IEntityTypeConfiguration<KanbanBoard>
{
    public void Configure(EntityTypeBuilder<KanbanBoard> b)
    {
        b.ToTable("PMS_KanbanBoards");
        b.Property(x => x.Name).HasMaxLength(128).IsRequired();
        b.HasOne(x => x.Project).WithMany(p => p.Boards).HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class KanbanColumnConfiguration : IEntityTypeConfiguration<KanbanColumn>
{
    public void Configure(EntityTypeBuilder<KanbanColumn> b)
    {
        b.ToTable("PMS_KanbanColumns");
        b.Property(x => x.Name).HasMaxLength(64).IsRequired();
        b.HasOne(x => x.Board).WithMany(bd => bd.Columns).HasForeignKey(x => x.BoardId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class KanbanCardConfiguration : IEntityTypeConfiguration<KanbanCard>
{
    public void Configure(EntityTypeBuilder<KanbanCard> b)
    {
        b.ToTable("PMS_KanbanCards");
        b.Property(x => x.Title).HasMaxLength(256).IsRequired();
        b.Property(x => x.Description).HasMaxLength(2000);
        b.HasOne(x => x.Column).WithMany(c => c.Cards).HasForeignKey(x => x.ColumnId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.ProjectItem).WithMany().HasForeignKey(x => x.ProjectItemId).OnDelete(DeleteBehavior.SetNull);
    }
}

public class KanbanCardAssigneeConfiguration : IEntityTypeConfiguration<KanbanCardAssignee>
{
    public void Configure(EntityTypeBuilder<KanbanCardAssignee> b)
    {
        b.ToTable("PMS_KanbanCardAssignees");
        b.HasOne(x => x.Card).WithMany(c => c.Assignees).HasForeignKey(x => x.CardId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.Person).WithMany(p => p.CardAssignments).HasForeignKey(x => x.PersonId).OnDelete(DeleteBehavior.Cascade);
    }
}

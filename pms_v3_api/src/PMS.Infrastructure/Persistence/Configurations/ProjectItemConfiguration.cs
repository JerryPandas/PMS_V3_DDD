using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMS.Domain.Entities;

namespace PMS.Infrastructure.Persistence.Configurations;

public class ProjectItemConfiguration : IEntityTypeConfiguration<ProjectItem>
{
    public void Configure(EntityTypeBuilder<ProjectItem> b)
    {
        b.ToTable("PMS_ProjectItems");
        b.Property(x => x.Name).HasMaxLength(128).IsRequired();
        b.Property(x => x.Description).HasMaxLength(2000);
        b.HasOne(x => x.Project).WithMany(p => p.Items).HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.Owner).WithMany(p => p.OwnedItems).HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.SetNull);
    }
}

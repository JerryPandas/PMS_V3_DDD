using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMS.Domain.Entities;

namespace PMS.Infrastructure.Persistence.Configurations;

public class ProjectFileConfiguration : IEntityTypeConfiguration<ProjectFile>
{
    public void Configure(EntityTypeBuilder<ProjectFile> b)
    {
        b.ToTable("PMS_ProjectFiles");
        b.Property(x => x.FileName).HasMaxLength(256).IsRequired();
        b.Property(x => x.StoredFileName).HasMaxLength(256).IsRequired();
        b.Property(x => x.RelativePath).HasMaxLength(512).IsRequired();
        b.HasOne(x => x.Project).WithMany(p => p.Files).HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.UploadedBy).WithMany().HasForeignKey(x => x.UploadedById).OnDelete(DeleteBehavior.SetNull);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PMS.Domain.Entities;

namespace PMS.Infrastructure.Persistence.Configurations;

public class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> b)
    {
        b.ToTable("PMS_People");
        b.Property(x => x.Name).HasMaxLength(64).IsRequired();
        b.Property(x => x.Department).HasMaxLength(64);
        b.Property(x => x.Position).HasMaxLength(64);
        b.Property(x => x.Email).HasMaxLength(128);
        b.Property(x => x.Phone).HasMaxLength(32);
    }
}

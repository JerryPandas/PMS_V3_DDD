using PMS.Domain.Common;

namespace PMS.Domain.Entities;

/// <summary>
/// 人员档案（人员管理模块聚合根）
/// </summary>
public class Person : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Position { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Avatar { get; set; }

    public ICollection<KanbanCardAssignee> CardAssignments { get; set; } = new List<KanbanCardAssignee>();
    public ICollection<ProjectItem> OwnedItems { get; set; } = new List<ProjectItem>();
}

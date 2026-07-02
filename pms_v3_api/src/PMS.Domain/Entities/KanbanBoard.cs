using PMS.Domain.Common;

namespace PMS.Domain.Entities;

/// <summary>
/// 看板（每个项目可以有一个或多个看板）
/// </summary>
public class KanbanBoard : BaseEntity
{
    public int? ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Name { get; set; } = string.Empty;

    public ICollection<KanbanColumn> Columns { get; set; } = new List<KanbanColumn>();
}

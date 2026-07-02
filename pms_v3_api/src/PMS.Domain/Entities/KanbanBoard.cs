using PMS.Domain.Common;

namespace PMS.Domain.Entities;

/// <summary>
/// Kanban board (each project can have one or more boards)
/// </summary>
public class KanbanBoard : BaseEntity
{
    public int? ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Name { get; set; } = string.Empty;

    public ICollection<KanbanColumn> Columns { get; set; } = new List<KanbanColumn>();
}

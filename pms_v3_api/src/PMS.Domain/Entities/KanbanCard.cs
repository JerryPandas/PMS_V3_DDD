using PMS.Domain.Common;
using PMS.Domain.Enums;

namespace PMS.Domain.Entities;

/// <summary>
/// Kanban card: specific task
/// </summary>
public class KanbanCard : BaseEntity
{
    public int ColumnId { get; set; }
    public KanbanColumn? Column { get; set; }

    public int? ProjectItemId { get; set; }
    public ProjectItem? ProjectItem { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CardPriority Priority { get; set; } = CardPriority.Normal;
    public DateTime? DueDate { get; set; }
    public int SortOrder { get; set; } = 0;

    public ICollection<KanbanCardAssignee> Assignees { get; set; } = new List<KanbanCardAssignee>();
}

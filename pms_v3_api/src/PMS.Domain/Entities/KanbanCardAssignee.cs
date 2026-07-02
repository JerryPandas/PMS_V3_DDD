using PMS.Domain.Common;

namespace PMS.Domain.Entities;

/// <summary>
/// Many-to-many relationship table between kanban cards and people
/// </summary>
public class KanbanCardAssignee : BaseEntity
{
    public int CardId { get; set; }
    public KanbanCard? Card { get; set; }

    public int PersonId { get; set; }
    public Person? Person { get; set; }
}

using PMS.Domain.Common;

namespace PMS.Domain.Entities;

/// <summary>
/// 看板卡片与人员的多对多关联表
/// </summary>
public class KanbanCardAssignee : BaseEntity
{
    public int CardId { get; set; }
    public KanbanCard? Card { get; set; }

    public int PersonId { get; set; }
    public Person? Person { get; set; }
}

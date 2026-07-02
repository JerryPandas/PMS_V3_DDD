using PMS.Domain.Common;

namespace PMS.Domain.Entities;

/// <summary>
/// 看板列，例如：待办 / 进行中 / 待验证 / 已完成
/// </summary>
public class KanbanColumn : BaseEntity
{
    public int BoardId { get; set; }
    public KanbanBoard? Board { get; set; }

    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
    public string? ColorHex { get; set; }

    public ICollection<KanbanCard> Cards { get; set; } = new List<KanbanCard>();
}

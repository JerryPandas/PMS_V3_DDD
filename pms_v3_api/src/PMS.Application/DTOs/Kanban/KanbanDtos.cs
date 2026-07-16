using PMS.Domain.Enums;

namespace PMS.Application.DTOs.Kanban;

public record KanbanCardDto(
    int Id, int ColumnId, int? ProjectItemId, string Title, string? Description,
    CardPriority Priority, DateTime? DueDate, int SortOrder,
    List<int> AssigneeIds, List<string> AssigneeNames
);

public record KanbanColumnDto(int Id, int BoardId, string Name, int SortOrder, string? ColorHex, List<KanbanCardDto> Cards);

public record KanbanBoardDto(int Id, int? ProjectId, string Name, List<KanbanColumnDto> Columns);

public record CreateBoardRequest(int? ProjectId, string Name);

public record CreateColumnRequest(string Name, int SortOrder, string? ColorHex);

public record CreateCardRequest(int ColumnId, string Title, string? Description, CardPriority Priority, DateTime? DueDate, List<int>? AssigneeIds, int? ProjectItemId);

public record UpdateCardRequest(string Title, string? Description, CardPriority Priority, DateTime? DueDate, List<int>? AssigneeIds);

/// <summary>拖拽移动卡片到目标列的指定顺序位置</summary>
public record MoveCardRequest(int CardId, int TargetColumnId, int TargetSortOrder);

/// <summary>整列卡片重排（含跨列移动）：按给定顺序重写每张卡的列与排序</summary>
public record ReorderCardsRequest(List<ColumnCardOrder> Columns);

/// <summary>某一列的有序卡片 id 列表</summary>
public record ColumnCardOrder(int ColumnId, List<int> CardIds);
